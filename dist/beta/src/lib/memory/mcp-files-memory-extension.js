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
exports.ChromaMemoryManager = exports.KnowledgeSourceClass = void 0;
exports.extractTags = extractTags;
exports.extractContext = extractContext;
var chromadb_1 = require("chromadb");
var default_embed_1 = require("@chroma-core/default-embed");
var fs_1 = require("fs");
var path_1 = require("path");
var KnowledgeSourceClass;
(function (KnowledgeSourceClass) {
    KnowledgeSourceClass["USER_PROVIDED"] = "user_provided";
    KnowledgeSourceClass["ENGINEER_ADDED"] = "engineer_added";
    KnowledgeSourceClass["SYSTEM_GENERATED"] = "system_generated";
    KnowledgeSourceClass["EXTERNAL_API"] = "external_api";
    KnowledgeSourceClass["DOCUMENT_PARSED"] = "document_parsed";
})(KnowledgeSourceClass || (exports.KnowledgeSourceClass = KnowledgeSourceClass = {}));
var ChromaMemoryManager = /** @class */ (function () {
    function ChromaMemoryManager(memoryDir) {
        this.initialized = false;
        this.memoryDir = memoryDir;
        try {
            // Connect to ChromaDB HTTP server with embedding function
            this.client = new chromadb_1.ChromaClient({
                host: "127.0.0.1",
                port: 8000
            });
            console.log("✓ ChromaDB client initialized");
        }
        catch (error) {
            console.error('ChromaDB initialization failed, will use JSON-only mode:', error);
            this.client = null;
        }
    }
    ChromaMemoryManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, getError_1, _b, error_1, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.initialized)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 13, , 14]);
                        // Ensure memory directory exists
                        return [4 /*yield*/, fs_1.promises.mkdir(this.memoryDir, { recursive: true })];
                    case 2:
                        // Ensure memory directory exists
                        _c.sent();
                        if (!this.client) return [3 /*break*/, 11];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 9, , 10]);
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 8]);
                        _a = this;
                        return [4 /*yield*/, this.client.getCollection({
                                name: "llm_conversation_memory",
                                embeddingFunction: new default_embed_1.DefaultEmbeddingFunction()
                            })];
                    case 5:
                        _a.collection = _c.sent();
                        console.log("✓ Connected to existing ChromaDB collection");
                        return [3 /*break*/, 8];
                    case 6:
                        getError_1 = _c.sent();
                        console.log("ℹ No existing collection found, creating new one");
                        // Only create new if collection doesn't exist
                        _b = this;
                        return [4 /*yield*/, this.client.createCollection({
                                name: "llm_conversation_memory",
                                embeddingFunction: new default_embed_1.DefaultEmbeddingFunction(),
                                metadata: {
                                    "hnsw:space": "cosine"
                                }
                            })];
                    case 7:
                        // Only create new if collection doesn't exist
                        _b.collection = _c.sent();
                        console.log("✓ Created new ChromaDB collection with cosine distance");
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _c.sent();
                        console.error("ChromaDB collection creation failed:", error_1);
                        throw error_1;
                    case 10:
                        console.log("✓ Chroma memory manager initialized with vector search");
                        return [3 /*break*/, 12];
                    case 11:
                        console.log("✓ Memory manager initialized (JSON-only mode)");
                        _c.label = 12;
                    case 12:
                        this.initialized = true;
                        return [3 /*break*/, 14];
                    case 13:
                        error_2 = _c.sent();
                        console.error("✗ ChromaDB failed, using JSON-only mode:", error_2);
                        this.client = null;
                        this.collection = null;
                        this.initialized = true; // Still consider it initialized, just without ChromaDB
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.initialized && this.client !== null && this.collection !== null];
            });
        });
    };
    ChromaMemoryManager.prototype.storeConversation = function (memory) {
        return __awaiter(this, void 0, void 0, function () {
            var id, document_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Always store to JSON as backup
                    return [4 /*yield*/, this.storeConversationToJson(memory)];
                    case 3:
                        // Always store to JSON as backup
                        _a.sent();
                        if (!this.client || !this.collection) {
                            return [2 /*return*/, true]; // JSON storage succeeded
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        id = "".concat(memory.sessionId, "_").concat(memory.timestamp);
                        document_1 = "User: ".concat(memory.userMessage, "\nAssistant: ").concat(memory.assistantResponse);
                        console.log('💾 Storing to ChromaDB:', {
                            id: id,
                            documentLength: document_1.length,
                            sessionId: memory.sessionId
                        });
                        // For ChromaDB server mode, it will generate embeddings automatically
                        return [4 /*yield*/, this.collection.add({
                                ids: [id],
                                documents: [document_1],
                                metadatas: [{
                                        sessionId: memory.sessionId,
                                        timestamp: memory.timestamp,
                                        userMessage: memory.userMessage,
                                        assistantResponse: memory.assistantResponse,
                                        context: memory.context.join(', '),
                                        tags: memory.tags.join(', ')
                                    }]
                            })];
                    case 5:
                        // For ChromaDB server mode, it will generate embeddings automatically
                        _a.sent();
                        console.log('✅ Successfully stored to ChromaDB');
                        return [2 /*return*/, true];
                    case 6:
                        error_3 = _a.sent();
                        console.error('ChromaDB storage failed, but JSON backup succeeded:', error_3);
                        return [2 /*return*/, true]; // JSON storage is still working
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.storeConversationToJson = function (memory) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionFile, existingData, content, error_4, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        sessionFile = path_1.default.join(this.memoryDir, "".concat(memory.sessionId, ".json"));
                        existingData = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(sessionFile, 'utf8')];
                    case 2:
                        content = _a.sent();
                        existingData = JSON.parse(content);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        existingData.push(memory);
                        return [4 /*yield*/, fs_1.promises.writeFile(sessionFile, JSON.stringify(existingData, null, 2))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_5 = _a.sent();
                        console.error('JSON storage failed:', error_5);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.searchRelevantMemories = function (query_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (query, sessionId, limit) {
            var results_1, error_6, jsonResults;
            var _a, _b;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("\uD83D\uDD0D Searching for: \"".concat(query, "\" (sessionId: ").concat(sessionId || 'all', ", limit: ").concat(limit, ")"));
                        if (!(this.collection && this.client)) return [3 /*break*/, 5];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        console.log('📊 Attempting ChromaDB vector search...');
                        return [4 /*yield*/, this.collection.query({
                                queryTexts: [query],
                                nResults: limit,
                                where: sessionId ? { sessionId: sessionId } : undefined
                            })];
                    case 2:
                        results_1 = _c.sent();
                        console.log('✅ ChromaDB search successful:', {
                            documentsCount: ((_a = results_1.documents[0]) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            hasDistances: !!results_1.distances[0],
                            distances: (_b = results_1.distances[0]) === null || _b === void 0 ? void 0 : _b.slice(0, 3), // Show first 3 distances
                            distanceRange: results_1.distances[0] ? {
                                min: Math.min.apply(Math, results_1.distances[0]),
                                max: Math.max.apply(Math, results_1.distances[0])
                            } : null
                        });
                        if (results_1.documents[0] && results_1.documents[0].length > 0) {
                            return [2 /*return*/, results_1.documents[0].map(function (doc, index) { return ({
                                    content: doc,
                                    metadata: results_1.metadatas[0][index],
                                    distance: results_1.distances[0][index]
                                }); })];
                        }
                        else {
                            console.log('⚠️ ChromaDB returned no results, falling back to JSON search');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        console.error('❌ Chroma search failed, falling back to JSON search:', error_6);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log('⚠️ ChromaDB not available, using JSON search directly');
                        _c.label = 6;
                    case 6:
                        // Fallback to JSON search
                        console.log('📄 Using JSON search fallback...');
                        return [4 /*yield*/, this.searchJsonMemories(query, sessionId, limit)];
                    case 7:
                        jsonResults = _c.sent();
                        console.log("\uD83D\uDCC4 JSON search returned ".concat(jsonResults.length, " results"));
                        return [2 /*return*/, jsonResults];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.searchJsonMemories = function (query_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (query, sessionId, limit) {
            var results, queryLower, files, _a, _i, files_1, file, filePath, content, memories, _b, memories_1, memory, searchText, error_7, error_8;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        results = [];
                        queryLower = query.toLowerCase();
                        if (!sessionId) return [3 /*break*/, 1];
                        _a = ["".concat(sessionId, ".json")];
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, fs_1.promises.readdir(this.memoryDir)];
                    case 2:
                        _a = _c.sent();
                        _c.label = 3;
                    case 3:
                        files = _a;
                        _i = 0, files_1 = files;
                        _c.label = 4;
                    case 4:
                        if (!(_i < files_1.length)) return [3 /*break*/, 9];
                        file = files_1[_i];
                        if (!file.endsWith('.json'))
                            return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        filePath = path_1.default.join(this.memoryDir, file);
                        return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf8')];
                    case 6:
                        content = _c.sent();
                        memories = JSON.parse(content);
                        for (_b = 0, memories_1 = memories; _b < memories_1.length; _b++) {
                            memory = memories_1[_b];
                            searchText = "".concat(memory.userMessage, " ").concat(memory.assistantResponse, " ").concat(memory.tags.join(' ')).toLowerCase();
                            if (searchText.includes(queryLower)) {
                                results.push({
                                    content: "User: ".concat(memory.userMessage, "\nAssistant: ").concat(memory.assistantResponse),
                                    metadata: {
                                        sessionId: memory.sessionId,
                                        timestamp: memory.timestamp,
                                        tags: memory.tags,
                                        context: memory.context
                                    },
                                    distance: 0.5 // Dummy distance for JSON search
                                });
                            }
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_7 = _c.sent();
                        // Skip invalid files
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: return [2 /*return*/, results.slice(0, limit)];
                    case 10:
                        error_8 = _c.sent();
                        console.error('JSON search failed:', error_8);
                        return [2 /*return*/, []];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.listSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs_1.promises.readdir(this.memoryDir)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, files
                                .filter(function (file) { return file.endsWith('.json'); })
                                .map(function (file) { return file.replace('.json', ''); })];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Failed to list sessions:', error_9);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.getAllSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.listSessions()];
            });
        });
    };
    ChromaMemoryManager.prototype.getSessionSummary = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var results, sessionFile, content, memories, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.collection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.searchRelevantMemories("", sessionId, 10)];
                    case 1:
                        results = _a.sent();
                        if (results.length > 0) {
                            return [2 /*return*/, {
                                    sessionId: sessionId,
                                    conversationCount: results.length,
                                    recentMemories: results.slice(0, 3)
                                }];
                        }
                        _a.label = 2;
                    case 2:
                        sessionFile = path_1.default.join(this.memoryDir, "".concat(sessionId, ".json"));
                        return [4 /*yield*/, fs_1.promises.readFile(sessionFile, 'utf8')];
                    case 3:
                        content = _a.sent();
                        memories = JSON.parse(content);
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                conversationCount: memories.length,
                                tags: __spreadArray([], new Set(memories.flatMap(function (m) { return m.tags; })), true),
                                context: __spreadArray([], new Set(memories.flatMap(function (m) { return m.context; })), true),
                                timeRange: {
                                    earliest: Math.min.apply(Math, memories.map(function (m) { return m.timestamp; })),
                                    latest: Math.max.apply(Math, memories.map(function (m) { return m.timestamp; }))
                                }
                            }];
                    case 4:
                        error_10 = _a.sent();
                        console.error("Failed to get session summary for ".concat(sessionId, ":"), error_10);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.buildContextPrompt = function (currentMessage_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (currentMessage, sessionId, maxLength) {
            var relevantMemories, context, currentLength, _i, relevantMemories_1, memory, addition, error_11;
            if (maxLength === void 0) { maxLength = 2000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.searchRelevantMemories(currentMessage, sessionId, 3)];
                    case 1:
                        relevantMemories = _a.sent();
                        if (relevantMemories.length === 0) {
                            return [2 /*return*/, ""];
                        }
                        context = "## Relevant Context from Previous Conversations:\n\n";
                        currentLength = context.length;
                        for (_i = 0, relevantMemories_1 = relevantMemories; _i < relevantMemories_1.length; _i++) {
                            memory = relevantMemories_1[_i];
                            addition = "### ".concat(memory.metadata.sessionId || 'Session', "\n").concat(memory.content, "\n\n");
                            if (currentLength + addition.length > maxLength) {
                                break;
                            }
                            context += addition;
                            currentLength += addition.length;
                        }
                        return [2 /*return*/, context];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Failed to build context prompt:', error_11);
                        return [2 /*return*/, ""];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.deleteSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionFile, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionFile = path_1.default.join(this.memoryDir, "".concat(sessionId, ".json"));
                        return [4 /*yield*/, fs_1.promises.unlink(sessionFile)];
                    case 1:
                        _a.sent();
                        // TODO: Also delete from ChromaDB if available
                        return [2 /*return*/, true];
                    case 2:
                        error_12 = _a.sent();
                        console.error("Failed to delete session ".concat(sessionId, ":"), error_12);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChromaMemoryManager.prototype.reloadAllMemoriesFromJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionFiles, loaded, errors, _i, sessionFiles_1, file, filePath, content, memories, _a, memories_2, memory, id, document_2, error_13, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.collection) {
                            console.error('ChromaDB not available for reload');
                            return [2 /*return*/, { loaded: 0, errors: 0 }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 13, , 14]);
                        return [4 /*yield*/, fs_1.promises.readdir(this.memoryDir)];
                    case 2:
                        sessionFiles = _b.sent();
                        loaded = 0;
                        errors = 0;
                        console.log("\uD83D\uDD04 Starting bulk reload of ".concat(sessionFiles.length, " session files into ChromaDB..."));
                        _i = 0, sessionFiles_1 = sessionFiles;
                        _b.label = 3;
                    case 3:
                        if (!(_i < sessionFiles_1.length)) return [3 /*break*/, 12];
                        file = sessionFiles_1[_i];
                        if (!file.endsWith('.json'))
                            return [3 /*break*/, 11];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 10, , 11]);
                        filePath = path_1.default.join(this.memoryDir, file);
                        return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf8')];
                    case 5:
                        content = _b.sent();
                        memories = JSON.parse(content);
                        _a = 0, memories_2 = memories;
                        _b.label = 6;
                    case 6:
                        if (!(_a < memories_2.length)) return [3 /*break*/, 9];
                        memory = memories_2[_a];
                        id = "".concat(memory.sessionId, "_").concat(memory.timestamp);
                        document_2 = "User: ".concat(memory.userMessage, "\nAssistant: ").concat(memory.assistantResponse);
                        return [4 /*yield*/, this.collection.add({
                                ids: [id],
                                documents: [document_2],
                                metadatas: [{
                                        sessionId: memory.sessionId,
                                        timestamp: memory.timestamp,
                                        userMessage: memory.userMessage,
                                        assistantResponse: memory.assistantResponse,
                                        context: memory.context.join(', '),
                                        tags: memory.tags.join(', ')
                                    }]
                            })];
                    case 7:
                        _b.sent();
                        loaded++;
                        _b.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 6];
                    case 9:
                        console.log("\u2713 Loaded ".concat(memories.length, " memories from ").concat(file));
                        return [3 /*break*/, 11];
                    case 10:
                        error_13 = _b.sent();
                        console.error("\u2717 Failed to load ".concat(file, ":"), error_13);
                        errors++;
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 3];
                    case 12:
                        console.log("\uD83C\uDF89 Bulk reload complete: ".concat(loaded, " memories loaded, ").concat(errors, " errors"));
                        return [2 /*return*/, { loaded: loaded, errors: errors }];
                    case 13:
                        error_14 = _b.sent();
                        console.error('Bulk reload failed:', error_14);
                        return [2 /*return*/, { loaded: 0, errors: 1 }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    return ChromaMemoryManager;
}());
exports.ChromaMemoryManager = ChromaMemoryManager;
// Utility functions - fix to match expected signatures
function extractTags(text) {
    var commonTags = [
        'javascript', 'typescript', 'python', 'react', 'node', 'docker',
        'kubernetes', 'aws', 'database', 'api', 'frontend', 'backend',
        'deployment', 'security', 'performance', 'testing', 'debugging',
        'configuration', 'integration', 'authentication', 'monitoring'
    ];
    var textLower = text.toLowerCase();
    return commonTags.filter(function (tag) { return textLower.includes(tag); });
}
function extractContext(text) {
    var context = [];
    // Extract file references
    var fileRegex = /(?:file:|filename:|path:)\s*([^\s,]+)/gi;
    var match;
    while ((match = fileRegex.exec(text)) !== null) {
        context.push("file: ".concat(match[1]));
    }
    // Extract URLs
    var urlRegex = /https?:\/\/[^\s,]+/gi;
    while ((match = urlRegex.exec(text)) !== null) {
        context.push("url: ".concat(match[0]));
    }
    return __spreadArray([], new Set(context), true);
}
