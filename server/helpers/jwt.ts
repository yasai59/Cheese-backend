// import jwt from 'jsonwebtoken';
// import { Secret } from 'jsonwebtoken';

// function extractOwnerIdFromToken(token: string): number | undefined {
//     let secret: Secret | undefined;
//     if (process.env.JWT_SECRET) {
//         secret = process.env.JWT_SECRET;
//     } else {
//         console.error('JWT_SECRET environment variable is not defined');
//         throw new Error('JWT_SECRET environment variable is not defined');
//     }

//     try {
//         const decoded: any = jwt.verify(token, secret);
//         return decoded.id;
//     } catch (error) {
//         console.error('Error decoding JWT token:', error);
//         return undefined;
//     }
// }
