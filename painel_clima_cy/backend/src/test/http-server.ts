import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';

import { Express } from 'express';

export interface StartedHttpServer {
  baseUrl: string;
  close(): Promise<void>;
}

export const startHttpServer = async (app: Express): Promise<StartedHttpServer> => {
  const server = createServer(app);
  const baseUrl = await listen(server);

  return {
    baseUrl,
    close: () => closeServer(server)
  };
};

const listen = async (server: Server): Promise<string> => {
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
};

const closeServer = async (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};
