// keep only the crucial landmarks to avoid cluttering the canvas
export const skipIndexes = [0, 1, 2, 3, 5, 4, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32];

// landmarkNames
export const joints = {
    NOSE: 0,
    LIEYE: 1,       // Left Eye (Inner)
    LEYE: 2,        // Left Eye
    LOEYE: 3,       // Left Eye (Outer)
    RIEYE: 4,       // Right Eye (Inner)
    REYE: 5,        // Right Eye
    ROEYE: 6,       // Right Eye (Outer)
    LEAR: 7,        // Left Ear
    REAR: 8,        // Right Ear
    LMOUTH: 9,      // Mouth (Left)
    RMOUTH: 10,     // Mouth (Right)
    LSHOULDER: 11, // Left Shoulder
    RSHOULDER: 12, // Right Shoulder
    LELBOW: 13,    // Left Elbow
    RELBOW: 14,    // Right Elbow
    LWRIST: 15,    // Left Wrist
    RWRIST: 16,    // Right Wrist
    LPINKY: 17,    // Left Pinky
    RPINKY: 18,    // Right Pinky
    LINDEX: 19,    // Left Index
    RINDEX: 20,    // Right Index
    LTHUMB: 21,    // Left Thumb
    RTHUMB: 22,    // Right Thumb
    LHIP: 23,      // Left Hip
    RHIP: 24,      // Right Hip
    LKNEE: 25,     // Left Knee
    RKNEE: 26,     // Right Knee
    LANKLE: 27,    // Left Ankle
    RANKLE: 28,    // Right Ankle
    LHEEL: 29,     // Left Heel
    RHEEL: 30,     // Right Heel
    LFOOTIX: 31,   // Left Foot Index
    RFOOTIX: 32,    // Right Foot Index
    BSPINE: 33,    // Bottom Spine, Middle point of the Hips (calculated)
    TSPINE: 34     // Top Spine, Middle point of the Shoulders (calculated) 
};

// these are the bones we want to draw
export const bones = {
    RTIBIA: [joints.RANKLE, joints.RKNEE],       // Right Tibia (Ankle to Knee)
    RFEMUR: [joints.RKNEE, joints.RHIP],         // Right Femur (Knee to Hip)
    HIPS: [joints.RHIP, joints.LHIP],          // Pelvis (Right Hip to Left Hip)
    LFEMUR: [joints.LKNEE, joints.LHIP],         // Left Femur (Hip to Knee)
    LTIBIA: [joints.LKNEE, joints.LANKLE],       // Left Tibia (Knee to Ankle)
    RFOREARM: [joints.RWRIST, joints.RELBOW],    // Right Forearm (Wrist to Elbow)
    RUPPERARM: [joints.RELBOW, joints.RSHOULDER],// Right Upper Arm (Elbow to Shoulder)
    SHOULDERS: [joints.RSHOULDER, joints.LSHOULDER], // Shoulders (Right to Left)
    LUPPERARM: [joints.LSHOULDER, joints.LELBOW],// Left Upper Arm (Shoulder to Elbow)
    LFOREARM: [joints.LELBOW, joints.LWRIST],    // Left Forearm (Elbow to Wrist)
    SPINE: [joints.BSPINE, joints.TSPINE],       // Spine (Bottom to Top)
};


export function calculatePositionDetails(landmarks) {
    // distance between left and right shoulder should be static
    // maybe use to calibrate distances, say 50cm
    // knee = 25, 26
    // ankle = 27, 28
    let hipDistance = calculate3DDistance(landmarks[23], landmarks[24]);
    let coef = 20 / hipDistance; // assuming average human hipdistance is static and 20cm
    let shoulderDistance = coef * calculate3DDistance(landmarks[11], landmarks[12]);
    let kneeDistance = coef * calculate3DDistance(landmarks[25], landmarks[26]);
    let ankleDistance = coef * calculate3DDistance(landmarks[27], landmarks[28]);

    return ({
            kneeDistance: Math.round(kneeDistance) + "cm",
            ankleDistance: Math.round(ankleDistance) + "cm",
            tibiaAngleDifference: Math.round(calculateTibiaAngleDifference(landmarks)) + "°",
            TODO: "kneeAngulation, hipAngulation, handPosition, rotation, schrägfart"
        });
}

function calculate3DDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateTibiaAngleDifference(lm) {
    // Calculate right tibia vector
    let RT = {
        x: lm[joints.RKNEE].x - lm[joints.RANKLE].x,
        y: lm[joints.RKNEE].y - lm[joints.RANKLE].y,
        z: lm[joints.RKNEE].z - lm[joints.RANKLE].z
    };

    // Calculate left tibia vector
    let LT = {
        x: lm[joints.LKNEE].x - lm[joints.LANKLE].x,
        y: lm[joints.LKNEE].y - lm[joints.LANKLE].y,
        z: lm[joints.LKNEE].z - lm[joints.LANKLE].z
    };

    // Calculate dot product
    let dotProduct = RT.x * LT.x + RT.y * LT.y + RT.z * LT.z;

    // Calculate magnitudes
    let RTmagnitude = Math.sqrt(RT.x * RT.x + RT.y * RT.y + RT.z * RT.z);
    let LTmagnitude = Math.sqrt(LT.x * LT.x + LT.y * LT.y + LT.z * LT.z);

    // Calculate angle in radians
    let angleRadians = Math.acos(dotProduct / (RTmagnitude * LTmagnitude));

    // Convert to degrees
    let angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees;
}
