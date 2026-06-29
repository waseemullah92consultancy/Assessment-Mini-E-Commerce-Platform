"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const products_service_1 = require("./products.service");
const add_image_dto_1 = require("./dto/add-image.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const UPLOADS_DIR = (0, path_1.join)(process.cwd(), 'uploads');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const multerOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            (0, fs_1.mkdirSync)(UPLOADS_DIR, { recursive: true });
            cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            cb(null, `${(0, crypto_1.randomUUID)()}${ext}`);
        },
    }),
    limits: { fileSize: MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
        }
    },
};
let AdminProductsController = class AdminProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAll(query) {
        return this.productsService.findAllAdmin(query);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    addImageUrl(id, dto) {
        return this.productsService.addImageUrl(id, dto.imageUrl);
    }
    uploadImage(id, file) {
        if (!file)
            throw new common_1.BadRequestException('Image file is required');
        return this.productsService.addImageFile(id, file.filename);
    }
};
exports.AdminProductsController = AdminProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/image'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_image_dto_1.AddImageUrlDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "addImageUrl", null);
__decorate([
    (0, common_1.Post)(':id/image/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "uploadImage", null);
exports.AdminProductsController = AdminProductsController = __decorate([
    (0, common_1.Controller)('admin/products'),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], AdminProductsController);
//# sourceMappingURL=admin-products.controller.js.map