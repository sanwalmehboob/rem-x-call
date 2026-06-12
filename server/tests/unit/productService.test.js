const { Product } = require('../../src/models');
const productService = require('../../src/services/productService');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/models', () => ({
    Product: {
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
    },
}));

describe('productService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        it('creates a product when payload is valid', async () => {
            const payload = {
                name: 'Premium Headset',
                image: 'data:image/png;base64,...',
                category: 'Electronics',
                qty: 200,
                sold: 0,
                price: 76,
            };
            const created = { id: 1, ...payload, userId: 10 };
            Product.create.mockResolvedValue(created);

            const result = await productService.createProduct(payload, 10);

            expect(result).toEqual(created);
            expect(Product.create).toHaveBeenCalledWith({
                name: 'Premium Headset',
                image: 'data:image/png;base64,...',
                category: 'Electronics',
                status: 'Available',
                qty: 200,
                sold: 0,
                price: 76,
                userId: 10,
            });
        });

        it('throws ApiError when name is missing', async () => {
            await expect(productService.createProduct({ qty: 10, price: 5.5 }, 10)).rejects.toBeInstanceOf(ApiError);
        });

        it('throws ApiError when qty is invalid', async () => {
            await expect(productService.createProduct({ name: 'Headset', qty: -5, price: 5.5 }, 10)).rejects.toBeInstanceOf(ApiError);
        });

        it('throws ApiError when price is invalid', async () => {
            await expect(productService.createProduct({ name: 'Headset', qty: 10, price: -10 }, 10)).rejects.toBeInstanceOf(ApiError);
        });
    });

    describe('getProducts', () => {
        it('returns list of products filtered by agent userId', async () => {
            const mockRows = [{ id: 1, name: 'Premium Headset', price: 76, userId: 10 }];
            Product.findAndCountAll.mockResolvedValue({ rows: mockRows, count: 1 });

            const result = await productService.getProducts({ page: 1, pageSize: 5, userId: 10 });

            expect(result.items).toEqual(mockRows);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 5,
                totalItems: 1,
                totalPages: 1,
            });
            expect(Product.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ userId: 10 }),
                })
            );
        });
    });

    describe('getProductById', () => {
        it('returns product if found', async () => {
            const product = { id: 1, name: 'Premium Headset', userId: 10 };
            Product.findByPk.mockResolvedValue(product);

            const result = await productService.getProductById(1);
            expect(result).toEqual(product);
        });

        it('throws ApiError if product is not found', async () => {
            Product.findByPk.mockResolvedValue(null);
            await expect(productService.getProductById(99)).rejects.toBeInstanceOf(ApiError);
        });
    });

    describe('updateProduct', () => {
        it('updates an existing product if owned by the user', async () => {
            const save = jest.fn();
            const product = {
                id: 1,
                name: 'Old Name',
                qty: 10,
                price: 15,
                userId: 10,
                save,
            };
            Product.findByPk.mockResolvedValue(product);

            const result = await productService.updateProduct(1, {
                name: 'New Name',
                qty: 20,
                price: 25,
            }, 10);

            expect(result.name).toBe('New Name');
            expect(result.qty).toBe(20);
            expect(result.price).toBe(25);
            expect(save).toHaveBeenCalled();
        });

        it('throws ApiError (403) when updating a product owned by another user', async () => {
            const product = {
                id: 1,
                name: 'Old Name',
                qty: 10,
                price: 15,
                userId: 99,
            };
            Product.findByPk.mockResolvedValue(product);

            await expect(productService.updateProduct(1, { name: 'New Name' }, 10)).rejects.toBeInstanceOf(ApiError);
        });
    });

    describe('deleteProduct', () => {
        it('deletes an existing product if owned by the user', async () => {
            const destroy = jest.fn();
            Product.findByPk.mockResolvedValue({ id: 1, userId: 10, destroy });

            await productService.deleteProduct(1, 10);
            expect(destroy).toHaveBeenCalled();
        });

        it('throws ApiError (403) when deleting a product owned by another user', async () => {
            Product.findByPk.mockResolvedValue({ id: 1, userId: 99 });

            await expect(productService.deleteProduct(1, 10)).rejects.toBeInstanceOf(ApiError);
        });
    });
});
