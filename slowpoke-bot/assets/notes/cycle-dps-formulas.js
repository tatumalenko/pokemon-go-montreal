const WeaveDamagePer100s 
= Math.floor(100000/AvgWeaveCycleLengthMs)
* (ChargePwr*(1+ChargeSTAB*0.2))
+ Math.ceiling(Math.floor(100000/AvgWeaveCycleLengthMs)*ErgRatio)
* (FastPwr*(1+(FastSTAB*0.2)))
+ Math.floor(
    (100000
        - (Math.floor(100000/AvgWeaveCycleLengthMs)
        * (ChargeSpeedMs+ChargeDelayMs)
        + Math.ceiling(Math.floor(100000/AvgWeaveCycleLengthMs)*ErgRatio)
            * FastSpeedMs)
    )/FastSpeedMs
  )
* (FastPwr*(1+(FastSTAB*0.2)))

if(ErgCost=100){
    ErgRatio = Math.ceiling(ErgCost/ErgGain);
} else ErgRatio = ErgCost/ErgGain

ChargeDur = ChargeSpeed + ChargeDelay;
ChargeDam = ChargePwr*(1 + ChargeSTAB*0.2);
FastDam = FastPwr*(1 + (FastSTAB*0.2));

const WDP100S 
=100/CycleLength*ChargeDam //Charge Damage per Cycle Length for 100s
+100/CycleLength*ErgRatio*FastDam //
+(100 - (100/CycleLength*ChargeDur + 100/CycleLength*ErgRatio*FastSpeed))/FastSpeed

const WDPS
=(ChargeDam/CycleLength)
+(FastDam/CycleLength)*ErgRatio
+(1 - (ChargeDur/CycleLength + (FastSpeed/CycleLength)*ErgRatio))/FastSpeed

const DPC
=(ChargeDam/CycleLength)
+(FastDam/CycleLength)*ErgRatio
+(1 - (ChargeDur/CycleLength + (FastSpeed/CycleLength)*ErgRatio))/FastSpeed


const CycleLength
= ErgRatio*FastSpeed + ChargeDur