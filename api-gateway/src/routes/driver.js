import express from "express";
import driverClient from "../grpc/driver.client.js";
import { authorize } from "../middlewares/auth/handler.js";

export const driverRouter = express.Router();

driverRouter.post(
    "/",
    authorize("ADMIN"),
    (req, res, next) => {
        driverClient.CreateDriver(
            {
                user_id: req.body.user_id,
                name: req.body.name,
                phone_number: req.body.phone_number,
                license_plate: req.body.license_plate,
                vehicle_type: req.body.vehicle_type
            },
            (error, response) => {
                if (error) {
                    return next(error);
                }

                if (response?.is_error) {
                    return next(
                        new Error(response.error_code)
                    );
                }

                res.status(201).json(response);
            }
        );
    }
);



driverRouter.get(
    "/me",
    authorize("DRIVER"),
    (req, res, next) => {
        driverClient.GetDriverByUserId(
            {
                user_id: req.user.user_id
            },
            (error, response) => {
                if (error) {
                    return next(error);
                }

                if (response?.is_error) {
                    return next(
                        new Error(response.error_code)
                    );
                }

                res.json(response);
            }
        );
    }
);

driverRouter.get(
    "/:id",
    authorize("CUSTOMER", "DRIVER", "ADMIN"),
    (req, res, next) => {
        driverClient.GetDriver(
            {
                id: Number(req.params.id)
            },
            (error, response) => {
                if (error) {
                    return next(error);
                }

                if (response?.is_error) {
                    return next(
                        new Error(response.error_code)
                    );
                }

                res.json(response);
            }
        );
    }
);

driverRouter.patch(
    "/me/status",
    authorize("DRIVER"),
    (req, res, next) => {
        driverClient.UpdateDriverStatusAndLocation(
            {
                user_id: req.user.user_id,
                status: req.body.status,
                latitude: req.body.lat,
                longitude: req.body.long
            },
            (error, response) => {
                if (error) {
                    return next(error);
                }

                if (response?.is_error) {
                    return next(
                        new Error(response.error_code)
                    );
                }

                res.json(response);
            }
        );
    }
);


driverRouter.patch("/:id", authorize("ADMIN"),
    (req, res, next)=>{
        driverClient.ApproveDriverProfile({
            driver_id: req.params.id,
            status: req.body.status
        }, (error, response)=>{
            if (error){
                next(error)
            }if (response?.is_error) {
                return next(
                    new Error(response.error_code)
                );
            }

            res.status(201).json(response);
    })
})

driverRouter.post(
    "/me",
    authorize("DRIVER"),
    (req, res, next) => {
        console.log("req.user:", req.user);
        console.log("req.body:", req.body);
        driverClient.CreateDriver(
            {
                user_id: req.user.user_id,
                name: req.body.name,
                phone_number: req.body.phone_number,
                license_plate: req.body.license_plate,
                vehicle_type: req.body.vehicle_type
            },
            (error, response) => {
                if (error) {
                    return next(error);
                }

                if (response?.is_error) {
                    return next(
                        new Error(response.error_code)
                    );
                }

                res.status(201).json(response);
            }
        );
    }
);