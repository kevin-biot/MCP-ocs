"use strict";
/**
 * OpenShift Client - ADR-001 Implementation
 *
 * Phase 1: CLI wrapper approach for rapid development
 * Uses `oc` command execution with proper error handling and output parsing
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.OpenShiftClient = void 0;
var child_process_1 = require("child_process");
var OpenShiftClient = /** @class */ (function () {
    function OpenShiftClient(config) {
        this.config = config;
        this.envVars = {};
        // Set up kubeconfig environment variable if provided
        if (config.kubeconfig) {
            this.envVars.KUBECONFIG = config.kubeconfig;
        }
    }
    /**
     * Validate connection to OpenShift cluster
     */
    OpenShiftClient.prototype.validateConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeOcCommand(['cluster-info'], { timeout: 10000 })];
                    case 1:
                        _a.sent();
                        console.error('✅ OpenShift connection validated');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to connect to OpenShift cluster: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get cluster information and status
     */
    OpenShiftClient.prototype.getClusterInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, versionOutput, whoamiOutput, projectOutput, versionData, currentUser, currentProject, configOutput, serverUrl, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                this.executeOcCommand(['version', '-o', 'json']),
                                this.executeOcCommand(['whoami']),
                                this.executeOcCommand(['project', '-q']).catch(function () { return 'default'; })
                            ])];
                    case 1:
                        _a = _c.sent(), versionOutput = _a[0], whoamiOutput = _a[1], projectOutput = _a[2];
                        versionData = JSON.parse(versionOutput);
                        currentUser = whoamiOutput.trim();
                        currentProject = projectOutput.trim();
                        return [4 /*yield*/, this.executeOcCommand(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}'])];
                    case 2:
                        configOutput = _c.sent();
                        serverUrl = configOutput.trim();
                        return [2 /*return*/, {
                                version: ((_b = versionData.clientVersion) === null || _b === void 0 ? void 0 : _b.gitVersion) || 'unknown',
                                serverUrl: serverUrl,
                                currentUser: currentUser,
                                currentProject: currentProject,
                                status: 'connected'
                            }];
                    case 3:
                        error_2 = _c.sent();
                        return [2 /*return*/, {
                                version: 'unknown',
                                serverUrl: 'unknown',
                                currentUser: 'unknown',
                                currentProject: 'unknown',
                                status: 'error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get pods in a namespace
     */
    OpenShiftClient.prototype.getPods = function (namespace, selector) {
        return __awaiter(this, void 0, void 0, function () {
            var args, output, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['get', 'pods'];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        if (selector) {
                            args.push('-l', selector);
                        }
                        args.push('-o', 'json');
                        return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1:
                        output = _a.sent();
                        data = JSON.parse(output);
                        return [2 /*return*/, (data.items || []).map(function (pod) { return _this.parsePodInfo(pod); })];
                }
            });
        });
    };
    /**
     * Describe a specific resource
     */
    OpenShiftClient.prototype.describeResource = function (resourceType, name, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['describe', resourceType, name];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get logs from a pod
     */
    OpenShiftClient.prototype.getLogs = function (podName_1, namespace_1) {
        return __awaiter(this, arguments, void 0, function (podName, namespace, options) {
            var args;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['logs', podName];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        if (options.container) {
                            args.push('-c', options.container);
                        }
                        if (options.lines) {
                            args.push('--tail', options.lines.toString());
                        }
                        if (options.since) {
                            args.push('--since', options.since);
                        }
                        return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get events in a namespace
     */
    OpenShiftClient.prototype.getEvents = function (namespace, fieldSelector) {
        return __awaiter(this, void 0, void 0, function () {
            var args, output, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['get', 'events'];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        if (fieldSelector) {
                            args.push('--field-selector', fieldSelector);
                        }
                        args.push('-o', 'json');
                        return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1:
                        output = _a.sent();
                        data = JSON.parse(output);
                        return [2 /*return*/, (data.items || []).map(function (event) { return _this.parseEventInfo(event); })];
                }
            });
        });
    };
    /**
     * Apply configuration from YAML/JSON
     */
    OpenShiftClient.prototype.applyConfig = function (config, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['apply', '-f', '-'];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        return [4 /*yield*/, this.executeOcCommandWithInput(args, config)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Scale a deployment
     */
    OpenShiftClient.prototype.scaleDeployment = function (name, replicas, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['scale', 'deployment', name, '--replicas', replicas.toString()];
                        if (namespace) {
                            args.push('-n', namespace);
                        }
                        else if (this.config.namespace) {
                            args.push('-n', this.config.namespace);
                        }
                        return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute raw oc command
     */
    OpenShiftClient.prototype.executeRawCommand = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOcCommand(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Clean up resources
     */
    OpenShiftClient.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Private helper methods
     */
    OpenShiftClient.prototype.executeOcCommand = function (args_1) {
        return __awaiter(this, arguments, void 0, function (args, options) {
            var timeout, sanitizedArgs, command, output, errorMessage;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                timeout = options.timeout || this.config.timeout;
                try {
                    sanitizedArgs = args.map(function (arg) { return _this.sanitizeArgument(arg); });
                    command = "".concat(this.config.ocPath, " ").concat(sanitizedArgs.join(' '));
                    console.error("\uD83D\uDD27 Executing: ".concat(command));
                    output = (0, child_process_1.execSync)(command, {
                        encoding: 'utf8',
                        timeout: timeout,
                        env: __assign(__assign({}, process.env), this.envVars),
                        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
                    });
                    return [2 /*return*/, output.toString()];
                }
                catch (error) {
                    errorMessage = error.stderr ? error.stderr.toString() : error.message;
                    throw new Error("OpenShift command failed: ".concat(errorMessage));
                }
                return [2 /*return*/];
            });
        });
    };
    OpenShiftClient.prototype.executeOcCommandWithInput = function (args, input) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var sanitizedArgs = args.map(function (arg) { return _this.sanitizeArgument(arg); });
                        var child = (0, child_process_1.spawn)(_this.config.ocPath, sanitizedArgs, {
                            env: __assign(__assign({}, process.env), _this.envVars),
                            stdio: ['pipe', 'pipe', 'pipe']
                        });
                        var stdout = '';
                        var stderr = '';
                        child.stdout.on('data', function (data) {
                            stdout += data.toString();
                        });
                        child.stderr.on('data', function (data) {
                            stderr += data.toString();
                        });
                        child.on('close', function (code) {
                            if (code === 0) {
                                resolve(stdout);
                            }
                            else {
                                reject(new Error("Command failed with code ".concat(code, ": ").concat(stderr)));
                            }
                        });
                        child.on('error', function (error) {
                            reject(error);
                        });
                        // Send input and close stdin
                        child.stdin.write(input);
                        child.stdin.end();
                        // Set timeout
                        setTimeout(function () {
                            child.kill('SIGTERM');
                            reject(new Error('Command timed out'));
                        }, _this.config.timeout);
                    })];
            });
        });
    };
    OpenShiftClient.prototype.sanitizeArgument = function (arg) {
        // Basic sanitization to prevent command injection
        // Allow alphanumeric, hyphens, dots, colons, slashes, equals, commas
        var sanitized = arg.replace(/[^a-zA-Z0-9\-\.\:\/\=\,\_\@\[\]]/g, '');
        // If sanitization changed the argument, it might be malicious
        if (sanitized !== arg && arg.includes(' ')) {
            // Quote arguments that contain spaces after sanitization
            return "\"".concat(sanitized, "\"");
        }
        return sanitized;
    };
    OpenShiftClient.prototype.parsePodInfo = function (pod) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var status = ((_a = pod.status) === null || _a === void 0 ? void 0 : _a.phase) || 'Unknown';
        var conditions = ((_b = pod.status) === null || _b === void 0 ? void 0 : _b.conditions) || [];
        var readyCondition = conditions.find(function (c) { return c.type === 'Ready'; });
        var ready = readyCondition ? (readyCondition.status === 'True' ? '1/1' : '0/1') : '0/1';
        var restarts = 0;
        if ((_c = pod.status) === null || _c === void 0 ? void 0 : _c.containerStatuses) {
            restarts = pod.status.containerStatuses.reduce(function (sum, cs) { return sum + (cs.restartCount || 0); }, 0);
        }
        return {
            name: ((_d = pod.metadata) === null || _d === void 0 ? void 0 : _d.name) || 'unknown',
            namespace: ((_e = pod.metadata) === null || _e === void 0 ? void 0 : _e.namespace) || 'unknown',
            status: status,
            ready: ready,
            restarts: restarts,
            age: this.calculateAge((_f = pod.metadata) === null || _f === void 0 ? void 0 : _f.creationTimestamp),
            ip: (_g = pod.status) === null || _g === void 0 ? void 0 : _g.podIP,
            node: (_h = pod.spec) === null || _h === void 0 ? void 0 : _h.nodeName
        };
    };
    OpenShiftClient.prototype.parseEventInfo = function (event) {
        var _a, _b, _c;
        return {
            type: event.type || 'Normal',
            reason: event.reason || 'Unknown',
            object: "".concat(((_a = event.involvedObject) === null || _a === void 0 ? void 0 : _a.kind) || 'Unknown', "/").concat(((_b = event.involvedObject) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown'),
            message: event.message || '',
            timestamp: event.firstTimestamp || event.eventTime || new Date().toISOString(),
            source: ((_c = event.source) === null || _c === void 0 ? void 0 : _c.component) || event.reportingComponent || 'Unknown'
        };
    };
    OpenShiftClient.prototype.calculateAge = function (creationTimestamp) {
        if (!creationTimestamp)
            return 'unknown';
        var created = new Date(creationTimestamp);
        var now = new Date();
        var diffMs = now.getTime() - created.getTime();
        var days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0)
            return "".concat(days, "d");
        if (hours > 0)
            return "".concat(hours, "h");
        return "".concat(minutes, "m");
    };
    return OpenShiftClient;
}());
exports.OpenShiftClient = OpenShiftClient;
