import { Router } from "express";
import { tripClient } from "../grpc/trip.client.js";
import { authorize } from "../middlewares/auth/handler.js";

export const tripRouter = Router();


tripRouter.get("/:id",(req, res, next)=>{
    const id = req.params.id
    if (!id){
        return res.status(400)
    }else{
        tripClient.GetTrip({
            id,
        }, (err, response)=>{
            if (err){
                return res.status(500).json({message: err})
            }
            if (response.is_error===true){
                return next(new Error(response.error_code))
            }
            return res.status(200).json(response)
        })
    }
})

tripRouter.get("/booking/:id",(req, res, next)=>{
    const id = req.params.id
    if (!id){
        return res.status(400)
    }else{
        tripClient.GetTrip({
            booking_id: id,
        }, (err, response)=>{
            if (err){
                return res.status(500).json({message: err})
            }
            if (response.is_error===true){
                return next(new Error(response.error_code))
            }
            return res.status(200).json(response)
        })
    }
})

tripRouter.patch(
    "/:id/status",
    authorize("DRIVER", "CUSTOMER"),
    (req, res, next) => {

        try {

            const id = req.params.id;

            if (!id) {
                return res.status(400).json({
                    message: "Trip ID không hợp lệ"
                });
            }

            const status = req.body.status;
            const role = req.user.role;

            // CUSTOMER chỉ được CANCELLED
            if (role === "CUSTOMER") {

                if (status !== "CANCELLED") {
                    return res.status(400).json({
                        message:
                            "Khách hàng chỉ có thể hủy chuyến"
                    });
                }

                const reason = req.body.cancel_reason;

                if (!reason) {
                    return res.status(400).json({
                        message: "Vui lòng nhập lý do hủy"
                    });
                }

                tripClient.CancelTrip({
                    id: Number(id),
                    cancel_reason: reason
                }, (err, response) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    if (response.is_error === true) {
                        return next(
                            new Error(response.error_code)
                        );
                    }

                    return res.status(200).json(response);
                });

                return;
            }


            // DRIVER chỉ được RIDING hoặc COMPLETED
            if (role === "DRIVER") {

                if (
                    status !== "RIDING" &&
                    status !== "COMPLETED"
                ) {
                    return res.status(400).json({
                        message:
                            "Tài xế chỉ có thể chuyển trạng thái sang RIDING hoặc COMPLETED"
                    });
                }

                tripClient.UpdateTripStatus({
                    id: Number(id),
                    status: status
                }, (err, response) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    if (response.is_error === true) {
                        return next(
                            new Error(response.error_code)
                        );
                    }

                    return res.status(200).json(response);
                });

                return;
            }


            return res.status(403).json({
                message: "Bạn không có quyền cập nhật trạng thái"
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: error.message
            });
        }
    }
);

tripRouter.patch(
    "/booking/:id/status",
    authorize("DRIVER", "CUSTOMER"),
    (req, res, next) => {

        try {

            const bookingId = req.params.id;

            if (!bookingId) {
                return res.status(400).json({
                    message: "Booking ID không hợp lệ"
                });
            }

            const status = req.body.status;
            const role = req.user.role;


            // CUSTOMER
            if (role === "CUSTOMER") {

                if (status !== "CANCELLED") {
                    return res.status(400).json({
                        message:
                            "Khách hàng chỉ có thể hủy chuyến"
                    });
                }

                const reason = req.body.cancel_reason;

                if (!reason) {
                    return res.status(400).json({
                        message: "Vui lòng nhập lý do hủy"
                    });
                }

                tripClient.CancelTrip({
                    booking_id: bookingId,
                    cancel_reason: reason
                }, (err, response) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    if (response.is_error === true) {
                        return next(
                            new Error(response.error_code)
                        );
                    }

                    return res.status(200).json(response);
                });

                return;
            }


            // DRIVER
            if (role === "DRIVER") {

                if (
                    status !== "RIDING" &&
                    status !== "COMPLETED"
                ) {
                    return res.status(400).json({
                        message:
                            "Tài xế chỉ có thể chuyển trạng thái sang RIDING hoặc COMPLETED"
                    });
                }

                return tripClient.UpdateTripStatus({
                    booking_id: bookingId,
                    status
                }, (error, response)=>{
                    console.log(response)
                    if (error){
                        return res.status(500).json({error})
                    }
                    if (response.is_error===true){
                        return next(new Error(response.error_code))
                    }
                    return res.status(200).json(response)
                })
            }


            return res.status(403).json({
                message: "Bạn không có quyền cập nhật trạng thái"
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: error.message
            });
        }
    }
);

