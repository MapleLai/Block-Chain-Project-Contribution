pragma solidity ^0.5.0;
contract Contribution {

    struct Person{
        //记录账户的累积捐款金额
        uint money;
    }
    
    struct Fundraising{
        //参与募捐的人数，同一个人捐款了两次算作有两个人参与了募捐
        uint participants;
        //目前筹集到的捐款
        uint funds;
        //募捐的目标金额
        uint target;
    }

    //募捐发起人
    address fundraiser;
    //为每个可能的地址存储一个"Person"
    mapping(address => Person) people;
    //记录这次募捐信息的一个变量
    Fundraising public fundraisings;
    //目前最大的捐款数
    uint _max;
    uint public pay;
    
    constructor() public {
        //把智能合约的部署者设置为募捐发起者
        fundraiser = msg.sender;
        fundraisings.participants = 0;
        fundraisings.funds = 0;
        fundraisings.target = 0;
        people[fundraiser].money = 0;
    }
    
    //设置目标金额
    function setTarget(uint _target) public {
        require(_target > 0);
        //只有募捐发起者可以设置目标金额
        if (msg.sender == fundraiser){
            fundraisings.target = _target;
        }
    }
    
    //进行捐款
    function contribute(uint _money) public {
        //如果此次募捐还没达到目标金额，捐款才能成功
        if (fundraisings.funds < fundraisings.target){
            //如果募捐离目标所需要的金额小于此次捐款数，则只收取需要的金额，退还多余捐款
            if (fundraisings.target - fundraisings.funds < _money) {
                fundraisings.participants = fundraisings.participants + 1;
                pay = fundraisings.target - fundraisings.funds;
                fundraisings.funds = fundraisings.funds + pay;
                people[msg.sender].money = people[msg.sender].money + pay;
            } 
            //成功捐款，募捐的筹集金额增加对应数值
            else {
                fundraisings.participants = fundraisings.participants + 1;
                pay = _money;
                fundraisings.funds = fundraisings.funds + _money;
                people[msg.sender].money = people[msg.sender].money + _money;
            }
            //统计最大捐款数
            if (people[msg.sender].money > _max){
                _max = people[msg.sender].money;
            }
        }
    }

    //公示最大捐款数
    function maxContribution() public view returns (uint max) {
        return _max;
    }

    //获取目标金额
    function getTarget() public view returns (uint target) {
        return fundraisings.target;
    }

    //获取已筹集资金
    function getFunds() public view returns (uint funds) {
        return fundraisings.funds;
    }

    //获取参与人次
    function getParticipants() public view returns (uint participants) {
        return fundraisings.participants;
    }

    function getPay() public view returns (uint _pay) {
        return pay;
    }
}