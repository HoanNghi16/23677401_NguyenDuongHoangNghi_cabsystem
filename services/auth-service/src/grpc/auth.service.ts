import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import {AuthController } from '../controller/auth.js';

export const authService ={
    Login: async(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => {
        try{
            const result = await AuthController.login(call.request);
            callback(null, result);
        }catch(error){
            callback(null, {
                error_code: error instanceof Error ? error.message : String(error),
                message: "Đăng nhập thất bại",
                is_error: true
            });
        }
    },
    DriverRegister: async(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => {
        try{
            const result = await AuthController.driverRegister(call.request);
            callback(null, result);
        }catch(error){
            console.log('error in grpc driver register', error);
            callback(null, {error_code: error instanceof Error ? error.message : String(error), message: "Đăng ký tài khoản lái xe thất bại", is_error: true});
        }
    },

    RefreshToken: async(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => {
        try{
            const result = await AuthController.refresh(call.request);
            callback(null, result);
        }catch(error){
            callback(null, {error_code: error instanceof Error ? error.message : String(error), message: "Làm mới token thất bại", is_error: true});
        }
    }
}