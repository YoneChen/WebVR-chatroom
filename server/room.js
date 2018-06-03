
const MAX_COUNT = 4;
class Room {
    constructor() {
        this.id = Date.now();
        this._userNumber = 0;
        this._userDataSet = {};
        // const camera_transform = { position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0} }
        this.roomseat
        this.room_seats = [
            {
                role_transform: {
                    position: { x: 0, y: 0, z: 8},
                    rotation: {x: 0, y: 0, z: 0}
                },
                empty: true
            },
            {
                role_transform: {
                    position: { x: 0, y: 0, z: -8},
                    rotation: {x: 0, y: Math.PI, z: 0}
                },
                empty: true
            },
            {
                role_transform: {
                    position: { x: -8, y: 0, z: 8},
                    rotation: {x: 0, y: Math.PI/-2, z: 0}
                },
                empty: true
            },
            {
                role_transform: {
                    position: { x: 8, y: 0, z: 0},
                    rotation: {x: 0, y: Math.PI/2, z: 0}
                },
                empty: true
            }
        ];
    }
    get userNumber() {
        return Object.keys(this._userDataSet).length
    }
    addUser(userId) {
        if (this.userNumber >= MAX_COUNT) return;
        let role_transform,role_No;
        for(let i = 0; i < this.room_seats.length; i++ ) {
            if (this.room_seats[i].empty) {
                role_transform = this.room_seats[i].role_transform;
                this.room_seats[i].empty = false;
                role_No = i;
                break;
            }
        }
        this._userDataSet[userId] = { role_transform,role_No };
        return this._userDataSet[userId];
    }
    removeUser(userId) {
        const index = this._userDataSet[userId].role_No;
        this.room_seats[index].empty = true;
        delete this._userDataSet[userId];
    }
    getUserDataList() {
        return Object.keys(this._userDataSet).map(userId => ({
            userId,
            roleData: this._userDataSet[userId]
        }));
    }
    check(userIdList) {
        const oldUserIdList = Object.keys(this._userDataSet);
        if (userIdList.sort().join() !== oldUserIdList.sort().join()) { // 有人掉线了
            oldUserIdList.forEach(userId => {
                if (!~userIdList.indexOf(userId)) this.removeUser(userId);
            })
        }
    }
}
module.exports = Room;