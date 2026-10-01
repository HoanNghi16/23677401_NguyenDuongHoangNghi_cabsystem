import { Router } from "express";

import customerClient from "../grpc/customer.client.js";
import { authorize } from "../middlewares/auth/handler.js";

export const customerRouter = Router();


// ============================================================
// GET /customers
// CUSTOMER + ADMIN: xem tất cả customer
// ============================================================
customerRouter.get(
    "/",
    authorize("CUSTOMER", "ADMIN"),
    (req, res, next) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        customerClient.getAllCustomer(
            {
                page,
                limit
            },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(200).json({
                    customers: response.customers,
                    total: response.total,
                    page,
                    limit
                });
            }
        );
    }
);


// ============================================================
// GET /customers/:id
// CUSTOMER + ADMIN: xem customer bất kỳ
// ============================================================
customerRouter.get(
    "/:id",
    authorize("CUSTOMER", "ADMIN"),
    (req, res, next) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid customer id"
            });
        }

        customerClient.getCustomer(
            { id },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(200).json(response.customer);
            }
        );
    }
);


// ============================================================
// POST /customers/me
// CUSTOMER: tạo customer profile của chính mình
// ============================================================
customerRouter.post(
    "/me",
    authorize("CUSTOMER"),
    (req, res, next) => {
        customerClient.createCustomer(
            {
                user_id: req.user.userId,
                name: req.body.name,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth
            },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(201).json(response.customer);
            }
        );
    }
);


// ============================================================
// POST /customers
// ADMIN: tạo customer cho user bất kỳ
// ============================================================
customerRouter.post(
    "/",
    authorize("ADMIN"),
    (req, res, next) => {
        customerClient.createCustomer(
            {
                user_id: req.body.user_id,
                name: req.body.name,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth
            },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(201).json(response.customer);
            }
        );
    }
);


// ============================================================
// PATCH /customers/me
// CUSTOMER: sửa thông tin của chính mình
// ============================================================
customerRouter.patch(
    "/me",
    authorize("CUSTOMER"),
    (req, res, next) => {
        customerClient.updateCustomer(
            {
                id: req.user.customerId,
                name: req.body.name,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth
            },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(200).json(response.customer);
            }
        );
    }
);


// ============================================================
// PATCH /customers/:id
// ADMIN: sửa customer bất kỳ
// ============================================================
customerRouter.patch(
    "/:id",
    authorize("ADMIN"),
    (req, res, next) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid customer id"
            });
        }

        customerClient.updateCustomer(
            {
                id,
                name: req.body.name,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth
            },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(200).json(response.customer);
            }
        );
    }
);


// ============================================================
// DELETE /customers/:id
// ADMIN: xóa customer
// ============================================================
customerRouter.delete(
    "/:id",
    authorize("ADMIN"),
    (req, res, next) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid customer id"
            });
        }

        customerClient.deleteCustomer(
            { id },
            (err, response) => {
                if (err) {
                    console.error("Error calling Customer Service:", err);
                    return next(err);
                }

                if (response?.is_error === true) {
                    return next(new Error(response.error_code));
                }

                return res.status(204).send();
            }
        );
    }
);
