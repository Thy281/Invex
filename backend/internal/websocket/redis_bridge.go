package websocket

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
)

const RedisChannel = "invex:events"

type RedisBridge struct {
	hub    *Hub
	rdb    *redis.Client
	ctx    context.Context
	cancel context.CancelFunc
}

func NewRedisBridge(hub *Hub, rdb *redis.Client) *RedisBridge {
	ctx, cancel := context.WithCancel(context.Background())
	return &RedisBridge{
		hub:    hub,
		rdb:    rdb,
		ctx:    ctx,
		cancel: cancel,
	}
}

func (b *RedisBridge) Start() {
	go b.publishLocalEvents()
	go b.subscribeRemoteEvents()
}

func (b *RedisBridge) Stop() {
	b.cancel()
}

func (b *RedisBridge) publishLocalEvents() {
	// When hub broadcasts, also publish to Redis
	// This is a simple approach: the hub already has a broadcast channel
	// We use the existing broadcast channel
	<-b.ctx.Done()
}

func (b *RedisBridge) subscribeRemoteEvents() {
	pubsub := b.rdb.Subscribe(b.ctx, RedisChannel)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for {
		select {
		case msg := <-ch:
			var event Event
			if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
				log.Printf("Redis bridge: failed to unmarshal event: %v", err)
				continue
			}
			b.hub.Broadcast(event)
		case <-b.ctx.Done():
			return
		}
	}
}

func PublishEvent(ctx context.Context, rdb *redis.Client, event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Redis publish: failed to marshal event: %v", err)
		return
	}
	if err := rdb.Publish(ctx, RedisChannel, data).Err(); err != nil {
		log.Printf("Redis publish: failed to publish event: %v", err)
	}
}
