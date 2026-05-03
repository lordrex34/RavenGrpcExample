# Example gRPC Server

TypeScript gRPC backend for the proto files in `../Protos`.

## Services

- `player.PlayerService/GetPlayer`
  - Supports player ids `1` through `5`.
- `world.WorldService/GetMyWorld`
  - Supports world ids `1` through `3`.

Unknown ids return gRPC `NOT_FOUND`.

## Run

```powershell
npm install
npm run build
npm start
```

By default the server listens on `0.0.0.0:50051`.

You can override the bind address with environment variables:

```powershell
$env:GRPC_HOST = "127.0.0.1"
$env:GRPC_PORT = "50052"
npm start
```

For development:

```powershell
npm run dev
```
