"use strict";
/**
 * Enhanced OpenShift CLI Wrapper v2.0
 *
 * Based on CLI mapping cheatsheet with:
 * - Input sanitization and validation
 * - Timeout handling with configurable limits
 * - Caching for expensive operations
 * - Structured error handling
 * - Performance optimization
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcWrapperV2 = void 0;
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var OcWrapperV2 = /** @class */ (function () {
    function OcWrapperV2(ocPath, defaultTimeout) {
        if (ocPath === void 0) { ocPath = 'oc'; }
        if (defaultTimeout === void 0) { defaultTimeout = 10000; }
        this.cache = new Map();
        this.ocPath = ocPath;
        this.defaultTimeout = defaultTimeout;
    }
    /**
     * Execute oc command with safety and performance optimizations
     */
    OcWrapperV2.prototype.executeOc = function (args_1) {
        return __awaiter(this, arguments, void 0, function (args, options) {
            var _a, timeout, namespace, _b, retries, cacheKey, _c, cacheTTL, finalArgs, fullCacheKey, cached, lastError, attempt, startTime, result, duration, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = options.timeout, timeout = _a === void 0 ? this.defaultTimeout : _a, namespace = options.namespace, _b = options.retries, retries = _b === void 0 ? 1 : _b, cacheKey = options.cacheKey, _c = options.cacheTTL, cacheTTL = _c === void 0 ? 30000 : _c;
                        // Input validation and sanitization
                        this.validateArgs(args);
                        finalArgs = __spreadArray([], args, true);
                        if (namespace) {
                            this.validateNamespace(namespace);
                            finalArgs.splice(1, 0, '-n', namespace);
                        }
                        fullCacheKey = cacheKey ? "".concat(cacheKey, ":").concat(finalArgs.join(':')) : null;
                        if (fullCacheKey && this.isValidCache(fullCacheKey)) {
                            cached = this.cache.get(fullCacheKey);
                            return [2 /*return*/, {
                                    stdout: cached.data,
                                    stderr: '',
                                    duration: 0,
                                    cached: true
                                }];
                        }
                        lastError = null;
                        attempt = 1;
                        _d.label = 1;
                    case 1:
                        if (!(attempt <= retries)) return [3 /*break*/, 8];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 7]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.executeWithTimeout(finalArgs, timeout)];
                    case 3:
                        result = _d.sent();
                        duration = Date.now() - startTime;
                        // Cache successful results
                        if (fullCacheKey && result.stdout) {
                            this.cache.set(fullCacheKey, {
                                data: result.stdout,
                                timestamp: Date.now(),
                                ttl: cacheTTL
                            });
                        }
                        return [2 /*return*/, {
                                stdout: result.stdout,
                                stderr: result.stderr,
                                duration: duration,
                                cached: false
                            }];
                    case 4:
                        error_1 = _d.sent();
                        lastError = error_1;
                        if (!(attempt < retries)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.delay(1000 * attempt)];
                    case 5:
                        _d.sent(); // Exponential backoff
                        _d.label = 6;
                    case 6: return [3 /*break*/, 7];
                    case 7:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 8: throw new Error("oc command failed after ".concat(retries, " attempts: ").concat(lastError === null || lastError === void 0 ? void 0 : lastError.message));
                }
            });
        });
    };
    /**
     * Get pods in namespace with structured output
     */
    OcWrapperV2.prototype.getPods = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOc(['get', 'pods', '-o', 'json'], {
                            namespace: namespace,
                            cacheKey: "pods:".concat(namespace),
                            cacheTTL: 15000 // 15s cache for pod data
                        })];
                    case 1:
                        result = _a.sent();
                        try {
                            return [2 /*return*/, JSON.parse(result.stdout)];
                        }
                        catch (error) {
                            throw new Error("Failed to parse pods JSON: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get events in namespace
     */
    OcWrapperV2.prototype.getEvents = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOc(['get', 'events', '-o', 'json'], {
                            namespace: namespace,
                            cacheKey: "events:".concat(namespace),
                            cacheTTL: 10000 // 10s cache for events
                        })];
                    case 1:
                        result = _a.sent();
                        try {
                            return [2 /*return*/, JSON.parse(result.stdout)];
                        }
                        catch (error) {
                            throw new Error("Failed to parse events JSON: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get PVCs in namespace
     */
    OcWrapperV2.prototype.getPVCs = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOc(['get', 'pvc', '-o', 'json'], {
                            namespace: namespace,
                            cacheKey: "pvcs:".concat(namespace),
                            cacheTTL: 20000 // 20s cache for PVCs
                        })];
                    case 1:
                        result = _a.sent();
                        try {
                            return [2 /*return*/, JSON.parse(result.stdout)];
                        }
                        catch (error) {
                            throw new Error("Failed to parse PVCs JSON: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get routes in namespace (OpenShift)
     */
    OcWrapperV2.prototype.getRoutes = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeOc(['get', 'route', '-o', 'json'], {
                                namespace: namespace,
                                cacheKey: "routes:".concat(namespace),
                                cacheTTL: 30000 // 30s cache for routes
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, JSON.parse(result.stdout)];
                    case 2:
                        error_2 = _a.sent();
                        // Routes might not be available (vanilla Kubernetes)
                        return [2 /*return*/, { items: [] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get deployments in namespace
     */
    OcWrapperV2.prototype.getDeployments = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOc(['get', 'deployments', '-o', 'json'], {
                            namespace: namespace,
                            cacheKey: "deployments:".concat(namespace),
                            cacheTTL: 20000 // 20s cache for deployments
                        })];
                    case 1:
                        result = _a.sent();
                        try {
                            return [2 /*return*/, JSON.parse(result.stdout)];
                        }
                        catch (error) {
                            throw new Error("Failed to parse deployments JSON: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get ingress in namespace (Kubernetes fallback)
     */
    OcWrapperV2.prototype.getIngress = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeOc(['get', 'ingress', '-o', 'json'], {
                                namespace: namespace,
                                cacheKey: "ingress:".concat(namespace),
                                cacheTTL: 30000
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, JSON.parse(result.stdout)];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, { items: [] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate namespace exists
     */
    OcWrapperV2.prototype.validateNamespaceExists = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeOc(['get', 'namespace', namespace], { timeout: 5000 })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear cache for namespace
     */
    OcWrapperV2.prototype.clearNamespaceCache = function (namespace) {
        var _this = this;
        var keysToRemove = Array.from(this.cache.keys())
            .filter(function (key) { return key.includes(":".concat(namespace)); });
        keysToRemove.forEach(function (key) { return _this.cache.delete(key); });
    };
    /**
     * Get cache statistics
     */
    OcWrapperV2.prototype.getCacheStats = function () {
        // Simple cache stats for monitoring
        return {
            size: this.cache.size,
            hitRate: 0.85 // Placeholder - implement actual tracking
        };
    };
    // Private helper methods
    OcWrapperV2.prototype.executeWithTimeout = function (args, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var command, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = "".concat(this.ocPath, " ").concat(args.join(' '));
                        // DEBUG: Log environment information
                        console.error("\uD83D\uDD27 Executing: ".concat(command));
                        console.error("\uD83D\uDD27 KUBECONFIG: ".concat(process.env.KUBECONFIG || 'NOT SET'));
                        console.error("\uD83D\uDD27 Current working directory: ".concat(process.cwd()));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, execAsync(command, {
                                timeout: timeout,
                                env: __assign(__assign({}, process.env), { KUBECONFIG: process.env.KUBECONFIG })
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        console.error("\u274C Command failed: ".concat(command));
                        console.error("\u274C Error: ".concat(error_4.message));
                        if (error_4.code === 'ETIMEDOUT') {
                            throw new Error("Command timed out after ".concat(timeout, "ms: ").concat(command));
                        }
                        throw new Error("Command failed: ".concat(command, " - ").concat(error_4.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OcWrapperV2.prototype.validateArgs = function (args) {
        // Prevent command injection
        var invalidChars = /[;&|`$(){}[\]<>]/;
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (typeof arg !== 'string') {
                throw new Error("Invalid argument type: ".concat(typeof arg));
            }
            if (invalidChars.test(arg)) {
                throw new Error("Invalid characters in argument: ".concat(arg));
            }
        }
        if (args.length === 0) {
            throw new Error('No arguments provided');
        }
    };
    OcWrapperV2.prototype.validateNamespace = function (namespace) {
        // Kubernetes namespace naming rules
        var namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
        if (!namespaceRegex.test(namespace)) {
            throw new Error("Invalid namespace name: ".concat(namespace));
        }
        if (namespace.length > 63) {
            throw new Error("Namespace name too long: ".concat(namespace.length, " characters"));
        }
    };
    OcWrapperV2.prototype.isValidCache = function (cacheKey) {
        var cached = this.cache.get(cacheKey);
        if (!cached)
            return false;
        var age = Date.now() - cached.timestamp;
        return age < cached.ttl;
    };
    OcWrapperV2.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return OcWrapperV2;
}());
exports.OcWrapperV2 = OcWrapperV2;
