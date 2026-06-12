const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const productService = require('../../src/services/productService');
const { User, RevokedToken } = require('../../src/models');

jest.mock('../../src/services/productService');

describe('Products routes', () => {
    let findByPkSpy;
    let revokedSpy;
    let authToken;

    beforeEach(() => {
        jest.clearAllMocks();

        findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            isActive: true,
            toJSON: () => ({ id: 10, email: 'agent@example.com' }),
        });
        revokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
        authToken = jwt.sign({ sub: 10, jti: 'products-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findByPkSpy.mockRestore();
        revokedSpy.mockRestore();
    });

    it('returns 401 for unauthenticated requests', async () => {
        const res = await request(app).get('/v1/products');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Please authenticate');
    });

    it('lists products for authenticated requests', async () => {
        productService.getProducts.mockResolvedValue({
            items: [{ id: 1, name: 'Premium Headset', userId: 10 }],
            pagination: { page: 1, totalPages: 1, totalItems: 1 }
        });

        const res = await request(app)
            .get('/v1/products?page=1&pageSize=5')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.products).toEqual([{ id: 1, name: 'Premium Headset', userId: 10 }]);
        expect(res.body.data).toEqual([{ id: 1, name: 'Premium Headset', userId: 10 }]);
        expect(productService.getProducts).toHaveBeenCalledWith(
            expect.objectContaining({
                page: '1',
                pageSize: '5',
                userId: 10,
            })
        );
    });

    it('creates product and associates it with agent userId', async () => {
        productService.createProduct.mockResolvedValue({ id: 2, name: 'Smart Kettle', userId: 10 });

        const res = await request(app)
            .post('/v1/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Smart Kettle', qty: 10, price: 89 });

        expect(res.status).toBe(201);
        expect(res.body.product).toEqual({ id: 2, name: 'Smart Kettle', userId: 10 });
        expect(productService.createProduct).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Smart Kettle', qty: 10, price: 89 }),
            10
        );
    });

    it('updates product', async () => {
        productService.updateProduct.mockResolvedValue({ id: 2, name: 'Smart Kettle Pro', userId: 10 });

        const res = await request(app)
            .put('/v1/products/2')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Smart Kettle Pro', qty: 15, price: 95 });

        expect(res.status).toBe(200);
        expect(res.body.product).toEqual({ id: 2, name: 'Smart Kettle Pro', userId: 10 });
        expect(productService.updateProduct).toHaveBeenCalledWith(
            '2',
            expect.objectContaining({ name: 'Smart Kettle Pro', qty: 15, price: 95 }),
            10
        );
    });

    it('deletes product', async () => {
        productService.deleteProduct.mockResolvedValue();

        const res = await request(app)
            .delete('/v1/products/2')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(204);
        expect(productService.deleteProduct).toHaveBeenCalledWith('2', 10);
    });
});
