"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { createServer } from "node:http";
//import next from "next";
//import { Server } from "socket.io";
var next = require("next");
var createServer = require("http").createServer;
var Server = require("socket.io").Server;
var lora_tags_1 = require("./lora/lora-tags");
var dev = process.env.NODE_ENV !== "production";
var hostname = "0.0.0.0";
var port = 3000;
// when using middleware `hostname` and `port` must be provided below
var app = next({ dev: dev, hostname: hostname, port: port });
var handler = app.getRequestHandler();
// let flag = false;
app.prepare().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    var httpServer, io;
    return __generator(this, function (_a) {
        httpServer = createServer(handler);
        io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
            path: "/socket.io/"
        });
        io.on("connection", function (socket) {
            console.log("Client Connected");
            // FROM FRONTEND TO PY
            socket.on(lora_tags_1.START_LOCATION_TRANSMISSION_TO_TRU, function (data) {
                console.log(lora_tags_1.START_LOCATION_TRANSMISSION_TO_TRU, data);
                io.emit(lora_tags_1.START_LOCATION_TRANSMISSION_TO_TRU_PY, data);
            });
            socket.on(lora_tags_1.INSTRUCTION_TO_USER, function (data) {
                console.log(lora_tags_1.INSTRUCTION_TO_USER);
                console.log(data);
                io.emit(lora_tags_1.INSTRUCTION_TO_USER_PY, data);
            });
            socket.on(lora_tags_1.TASK_TO_RESCUER, function (data) {
                console.log(lora_tags_1.TASK_TO_RESCUER);
                console.log(data);
                io.emit(lora_tags_1.TASK_TO_RESCUER_PY, data);
            });
            socket.on(lora_tags_1.OBSTACLE_TO_RESCUER, function (data) {
                console.log(lora_tags_1.OBSTACLE_TO_RESCUER);
                console.log(data);
                io.emit(lora_tags_1.OBSTACLE_TO_RESCUER_PY, data);
            });
            // FROM PY TO FRONTEND 
            socket.on(lora_tags_1.LOCATION_FROM_USER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.LOCATION_FROM_USER, data);
            });
            socket.on(lora_tags_1.SOS_FROM_USER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.SOS_FROM_USER, data);
            });
            socket.on(lora_tags_1.LOCATION_FROM_RESCUER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.LOCATION_FROM_RESCUER, data);
            });
            socket.on(lora_tags_1.SOS_FROM_RESCUER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.SOS_FROM_RESCUER, data);
            });
            socket.on(lora_tags_1.TASK_ACKNOWLEDGEMENT_FROM_RESCUER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.SOS_FROM_RESCUER, data);
            });
            socket.on(lora_tags_1.TASK_STATUS_UPDATE_FROM_RESCUER_PY, function (data) {
                console.log(data);
                io.emit(lora_tags_1.TASK_STATUS_UPDATE_FROM_RESCUER, data);
            });
        });
        httpServer
            .once("error", function (err) {
            console.error(err);
            process.exit(1);
        })
            .listen(port, function () {
            console.log("> Ready on http://".concat(hostname, ":").concat(port));
        });
        return [2 /*return*/];
    });
}); });
