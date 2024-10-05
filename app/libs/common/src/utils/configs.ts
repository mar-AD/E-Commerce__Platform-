import * as bcrypt from 'bcrypt'
import { catchError, from, Observable, switchMap } from 'rxjs';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { messages } from '@app/common/utils/messages';

//this for hashing password
export const hashPassword = (password: string):Observable<string> => {
  return from(bcrypt.genSalt(10)).pipe(
    switchMap((salt)=>
      from(bcrypt.hash(password, salt)).pipe(
        catchError((err)=>{
          throw new BadRequestException({
            status: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            message: err.response || messages.PASSWORD.FAILED_TO_HASH_PASSWORD
          })
        })
      )
    )
  )
}

//compare password
export const verifyPassword = (password: string, currentPass: string):Observable<boolean> => {
  return from(bcrypt.compare(password, currentPass))
}

//set the expiration date (refreshToken / email code ...)
export const getExpiryDate = (days: number = 0, hours: number = 0, minutes:number = 0): Date =>{
  const date = new Date()
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

//generate update email code
export const generateEmailCode = () => {
  let code = '';
  for (let i=0; i <= 6; i++){
    const randomDigits = Math.floor(Math.random()*10)
    code += randomDigits
  }
  return code;
}

//verify the email code
export const VerifyEmailCode = (expired: Date)=>{
  let currentDate = new Date()
  if(currentDate > expired){
    throw new BadRequestException({
      status: HttpStatus.GONE,
      message: 'Verification code has expired.',
    });
  }
}

