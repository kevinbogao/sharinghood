import dotenv from "dotenv";
dotenv.config();

import { CONFIG, RuntimeEnvironmentEnum } from "../../lib/Config";
import { listenerLogger } from "../../lib/logger/Logger";
import { handleSubscriptions } from "./handlers/subscription";
import { io } from "./utils/io";

io.listen(CONFIG.SERVER.RUNTIME_ENVIRONMENT === RuntimeEnvironmentEnum.LOCAL ? CONFIG.SOCKET.PORT : 80);

function main(): void {
  try {
    handleSubscriptions();
  } catch (err) {
    listenerLogger.error((err as Error).message);
  }
}

main();
