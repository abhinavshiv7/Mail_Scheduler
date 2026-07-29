"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const emailWorker_1 = require("./worker/emailWorker");
const PORT = process.env.PORT || 8080;
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    (0, emailWorker_1.startWorker)(); // Start BullMQ worker in the same process
});
