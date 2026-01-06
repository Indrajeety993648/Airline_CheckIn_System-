# Scaling Strategy

## Horizontal Scaling
- **API Nodes**: The backend is stateless. Increase replica count in Docker/K8s to handle more traffic.
- **Load Balancer**: Nginx distributes traffic round-robin.

## Database Scaling
- **Read Replicas**: Direct all `GET` requests (Lookup, Flight Info) to Read Replicas.
- **Connection Pooling**: `pg-pool` is used to manage connections efficiently.
- **Sharding**: (Future) Shard by `flight_id` or `date` if one DB instance is overwhelmed.

## Caching Strategy
- **Seat Maps**: Cached in Redis with short TTL (e.g., 5 seconds) or invalidated on change.
- **Static Data**: Flight schedules cached with long TTL.

## Handling Spikes (Check-in Open)
- **Overbooking Control**: Strict limits in `OverbookingService`.
- **Queueing**: (Future) Introduce RabbitMQ/Kafka for asynchronous check-in processing if synchronous processing times out.
