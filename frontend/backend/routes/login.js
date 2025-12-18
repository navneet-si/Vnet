import { Router } from "express";
const router=Router();
router.post('/',(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

})
export default router;