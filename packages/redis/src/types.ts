// import type { Server } from "@repo/validators/server";

// export type ServerEvent =
//   | {
//       type: "SERVER_UPDATED";
//       payload: Server;
//     }
//   | {
//       type: "MEMBER_JOINED";
//       payload: {
//         server: Server;
//         userId: string;
//       };
//     }
//   | {
//       type: "MEMBER_LEFT";
//       payload: {
//         server: Server;
//         userId: string;
//       };
//     };

// biome-ignore lint/complexity/noBannedTypes: ignore for now
export type EventMap = {
  // server: ServerEvent;
};
