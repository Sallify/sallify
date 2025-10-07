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

export type MessageEvent = {
  type: "MESSAGE_CREATED";
  payload: {
    serverId: string;
    channelId: string;
    content: string;
    author: {
      name: string;
      image: string | null;
    };
  };
};

export type EventMap = {
  // server: ServerEvent;
  message: MessageEvent;
};
