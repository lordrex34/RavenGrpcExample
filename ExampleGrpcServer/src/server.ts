import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";

type ProtoService = grpc.ServiceClientConstructor & {
  service: grpc.ServiceDefinition;
};

type Player = {
  player_id: number;
  name: string;
  title: string;
  player_race: number;
  player_class: number;
  level: number;
  xp: number;
  sp: number;
};

type WorldStatus = {
  world_id: number;
  name: string;
  time: string;
};

type GetPlayerRequest = {
  player_id?: number;
};

type GetPlayerResponse = {
  player: Player;
};

type GetMyWorldRequest = {
  world_id?: number;
};

type GetMyWorldResponse = {
  world_status: WorldStatus;
};

const PLAYER_RACE_HUMAN = 0;
const PLAYER_RACE_ELF = 1;
const PLAYER_RACE_DWARF = 2;

const PLAYER_CLASS_WARRIOR = 0;
const PLAYER_CLASS_PRIEST = 1;
const PLAYER_CLASS_MAGE = 2;

const protoRoot = path.resolve(__dirname, "../../Protos");
const playerProtoPath = path.join(protoRoot, "player.proto");
const worldProtoPath = path.join(protoRoot, "world.proto");

const packageDefinition = protoLoader.loadSync(
  [playerProtoPath, worldProtoPath],
  {
    defaults: true,
    includeDirs: [protoRoot],
    keepCase: true,
    longs: Number,
    oneofs: true
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as grpc.GrpcObject;

const playerPackage = protoDescriptor.player as grpc.GrpcObject;
const worldPackage = protoDescriptor.world as grpc.GrpcObject;

const PlayerService = playerPackage.PlayerService as ProtoService;
const WorldService = worldPackage.WorldService as ProtoService;

const createServiceError = (code: grpc.status, details: string): grpc.ServiceError => {
  const error = new Error(details) as grpc.ServiceError;
  error.code = code;
  error.details = details;
  error.metadata = new grpc.Metadata();

  return error;
};

const players = new Map<number, Player>([
  [
    1,
    {
      player_id: 1,
      name: "Ava Dawnforge",
      title: "Knight of First Light",
      player_race: PLAYER_RACE_HUMAN,
      player_class: PLAYER_CLASS_WARRIOR,
      level: 12,
      xp: 18400,
      sp: 7
    }
  ],
  [
    2,
    {
      player_id: 2,
      name: "Lethariel Moonbrook",
      title: "Keeper of the Grove",
      player_race: PLAYER_RACE_ELF,
      player_class: PLAYER_CLASS_PRIEST,
      level: 18,
      xp: 42100,
      sp: 12
    }
  ],
  [
    3,
    {
      player_id: 3,
      name: "Borin Emberhand",
      title: "Runesmith",
      player_race: PLAYER_RACE_DWARF,
      player_class: PLAYER_CLASS_MAGE,
      level: 15,
      xp: 30350,
      sp: 10
    }
  ],
  [
    4,
    {
      player_id: 4,
      name: "Mira Ashvale",
      title: "Battle Cleric",
      player_race: PLAYER_RACE_HUMAN,
      player_class: PLAYER_CLASS_PRIEST,
      level: 9,
      xp: 9600,
      sp: 5
    }
  ],
  [
    5,
    {
      player_id: 5,
      name: "Thalen Starwhisper",
      title: "Arcane Warden",
      player_race: PLAYER_RACE_ELF,
      player_class: PLAYER_CLASS_MAGE,
      level: 21,
      xp: 67800,
      sp: 15
    }
  ]
]);

const worlds = new Map<number, WorldStatus>([
  [
    1,
    {
      world_id: 1,
      name: "Ravenholm",
      time: "Morning"
    }
  ],
  [
    2,
    {
      world_id: 2,
      name: "Elderfall",
      time: "Noon"
    }
  ],
  [
    3,
    {
      world_id: 3,
      name: "Stormpeak",
      time: "Night"
    }
  ]
]);

const getPlayer: grpc.handleUnaryCall<GetPlayerRequest, GetPlayerResponse> = (
  call,
  callback
) => {
  const playerId = call.request.player_id;

  if (playerId === undefined) {
    callback(createServiceError(grpc.status.INVALID_ARGUMENT, "player_id is required"));
    return;
  }

  const player = players.get(playerId);

  if (!player) {
    callback(createServiceError(grpc.status.NOT_FOUND, `Player ${playerId} was not found`));
    return;
  }

  callback(null, { player });
};

const getMyWorld: grpc.handleUnaryCall<GetMyWorldRequest, GetMyWorldResponse> = (
  call,
  callback
) => {
  const worldId = call.request.world_id;

  if (worldId === undefined) {
    callback(createServiceError(grpc.status.INVALID_ARGUMENT, "world_id is required"));
    return;
  }

  const worldStatus = worlds.get(worldId);

  if (!worldStatus) {
    callback(createServiceError(grpc.status.NOT_FOUND, `World ${worldId} was not found`));
    return;
  }

  callback(null, { world_status: worldStatus });
};

const server = new grpc.Server();

server.addService(PlayerService.service, {
  GetPlayer: getPlayer
});

server.addService(WorldService.service, {
  GetMyWorld: getMyWorld
});

const host = process.env.GRPC_HOST ?? "0.0.0.0";
const port = process.env.GRPC_PORT ?? "50051";
const address = `${host}:${port}`;

server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
  if (error) {
    console.error(`Failed to bind gRPC server on ${address}:`, error);
    process.exit(1);
  }

  console.log(`gRPC server listening on ${host}:${boundPort}`);
  console.log("Player ids: 1, 2, 3, 4, 5");
  console.log("World ids: 1, 2, 3");
});
