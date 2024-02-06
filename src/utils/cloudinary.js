import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnClodinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log("file is uploaded in cloudinary ", response.url)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath,(err)=>{
            if(err){
                console.log(`Error deleting file:${err}`)

            }
            else{
                console.log(`File is deleted successfully`)
            }
        })// remove the locally saved temporary file as the upload operation got failed

        return null
    }
}


export {uploadOnClodinary}