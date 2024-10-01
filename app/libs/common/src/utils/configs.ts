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

//get the refreshToken expiration date
export const getExpiryDate = (days: number): Date =>{
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

