
class Room {
    constructor(maxCount = 4) {
        this.maxCount = maxCount;
        this._userNumber = 0;
        this._userDataSet = {};
        this.roleDataSet = [
            {
                position: { x: 0, y: 0, z: 0},
                rotation: {x: 0, y: 0, z: 0}
            },
            {
                position: { x: 2, y: Math.PI, z: 2},
                rotation: {x: 0, y: 0, z: 0}
            },
            {
                position: { x: 0, y: 0, z: -2},
                rotation: {x: 0, y: 0, z: 0}
            },
            {
                position: { x: -2, y: 0, z: 0},
                rotation: {x: 0, y: 0, z: 0}
            }
        ];
    }
    getOnlineNumber() {
        return this._userNumber
    }
    addUser(userId) {
        if (this._userNumber >= this.maxCount) return;
        this._userNumber++;
        this._userDataSet[userId] = this.roleDataSet[this._userNumber];
        return this._userDataSet[userId];
    }
    removeUser(userId) {
        this._userNumber--;
        delete this._userDataSet[userId];
    }
    getInitRoleData(userId) {
        if (!userId) return this.roleDataSet;
        else return this.roleDataSet[this._userNumber];
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