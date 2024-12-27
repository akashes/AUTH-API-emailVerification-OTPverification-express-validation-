export const oneMinuteExpiry=async(otpTime)=>{
    try {
        console.log('Timestamp is',otpTime)
        const cTime= new Date()
        console.log('cTime',cTime)
        console.log('ctimeGetTime',cTime.getTime())
       
        var diffInTime = (otpTime-cTime.getTime())/1000
        diffInTime/=60
        console.log('diffinTime',Math.abs(diffInTime))

        if(Math.abs(diffInTime)>1){
            return true

        }
        return false
        
    } catch (error) {
        console.log(error)
    }

}

export const threeMinuteExpiry=async(otpTime)=>{
    try {
        console.log('Timestamp is',otpTime)
        const cTime= new Date()
        console.log('cTime',cTime)
        console.log('ctimeGetTime',cTime.getTime())
       
        var diffInTime = (otpTime-cTime.getTime())/1000
        diffInTime/=60
        console.log('diffinTime',Math.abs(diffInTime))

        if(Math.abs(diffInTime)>3){
            return true

        }
        return false
        
    } catch (error) {
        console.log(error)
    }

}

