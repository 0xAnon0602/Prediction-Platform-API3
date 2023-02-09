// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import"https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
import "@api3/airnode-protocol-v1/contracts/dapis/DapiReader.sol";


contract Prediction_Platform is DapiReader{

using SafeMath for uint256;

bool public gameStatus;
bool public joinStatus;
uint256 public gameIndex;
uint256 public gameIndexQueue;
address public owner;
uint256 public endTimestamp;
uint256 public totalGameAmount;
uint256 public platformCommission;

address[] public userEntered;
address[] private usersWon; 

mapping(string => bytes32) public dataFeedAddresses;
mapping(address => uint256) private percentageRatio;
mapping(uint256 => gameStructSecond) public allGames;
mapping(address => joinStruct) public userResponses;

struct gameStruct {
    string name;
    int224 startPrice;
    uint256 time;
} 

struct gameStructSecond {
    string name;
    uint256 time;
} 
struct joinStruct {
    bool choice;
    uint256 amount;
}

gameStruct public currentGame;

constructor(uint256 _platCom,address _dapiServer) DapiReader(_dapiServer){
    owner=msg.sender;
    gameIndex=0;
    gameIndexQueue=0;
    gameStatus=false;
    joinStatus=false;
    endTimestamp=0;
    platformCommission=_platCom;

}


modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

modifier userAlreadyJoined() {
    
    bool userJoined = false;

    for(uint256 x; x!=userEntered.length;x++){
        if(userEntered[x]==msg.sender){
            userJoined=true;
            break;
        }
    }
    require(userJoined == false, "User has already joined the game");
    _;
}


    function readBeaconValueWithId(bytes32 beaconId)
        internal
        view
        returns (int224 value)
    {
        value = IDapiServer(dapiServer).readDataFeedValueWithId(beaconId);
    }



function addGame(string memory _coinName , uint256 _time) public onlyOwner{

    gameStructSecond memory tempGameInfo;
    tempGameInfo = gameStructSecond(_coinName,_time);
    allGames[gameIndexQueue]=tempGameInfo;
    gameIndexQueue++;

}

function addBeaconId(string memory _coinName,bytes32 _beaconId) public onlyOwner{
    dataFeedAddresses[_coinName]=_beaconId;
}

function startGame() public{

    require(!gameStatus && joinStatus && gameIndexQueue>gameIndex);
    int224 _startPrice;
    _startPrice = readBeaconValueWithId(dataFeedAddresses[allGames[gameIndex].name]);

    currentGame = gameStruct(allGames[gameIndex].name , _startPrice , allGames[gameIndex].time);
    gameStatus=true;
    joinStatus=false;
    endTimestamp=block.timestamp+allGames[gameIndex].time;

 
}

function endGame() public payable{

    require(gameStatus && block.timestamp>=endTimestamp);

    divideEarning();   

    gameStatus=false;
    gameIndex++;
    endTimestamp=0;

    while (userEntered.length!=0) {
        userEntered.pop();
    }

    while (usersWon.length!=0) {
        usersWon.pop();
    }
    totalGameAmount=0;
}

function joinGame(bool _choice,uint256 _amount) public userAlreadyJoined payable {

    require(joinStatus && msg.value!=0 && msg.value==_amount);
  
    joinStruct memory tempJoinInfo;
    userEntered.push(msg.sender);
    tempJoinInfo= joinStruct(_choice,_amount);
    userResponses[msg.sender]=tempJoinInfo;
    totalGameAmount+=_amount;

}

function emegencyWithdraw(uint256 _amount) public payable onlyOwner{
    payable(address(this)).transfer(_amount);
}

function changePlatformCommisson(uint256 _newAmount) public onlyOwner {
    platformCommission=_newAmount;
}

function usersJoined() public view returns(uint256){
    return userEntered.length;
}

function divideEarning() internal  {

    int224 _endPrice;
    _endPrice = readBeaconValueWithId(dataFeedAddresses[allGames[gameIndex].name]);


    if(userEntered.length>1){
        
        uint256 _amountToDistribute = (totalGameAmount*(100-platformCommission))/100;
        uint256 _totalAmountWon = 0;

        if(_endPrice!=currentGame.startPrice){

        for(uint256 x ; x!=userEntered.length;x++){

            if(userResponses[userEntered[x]].choice==true){

                if(_endPrice>currentGame.startPrice){
                    
                    usersWon.push(userEntered[x]);
                    _totalAmountWon += userResponses[userEntered[x]].amount;

                }


            }
            else if (userResponses[userEntered[x]].choice==false){


                if(_endPrice<currentGame.startPrice){
                    usersWon.push(userEntered[x]);
                    _totalAmountWon += userResponses[userEntered[x]].amount;

                }
                

            }

        }
        if(usersWon.length!=userEntered.length){

                for(uint256 x ; x!=usersWon.length;x++){

                    uint256 _amountToSend = ((userResponses[usersWon[x]].amount*_amountToDistribute)/_totalAmountWon);
                    payable(usersWon[x]).transfer(_amountToSend);      

                }

        }else{
            for(uint256 x ; x!=userEntered.length;x++){
                payable(userEntered[x]).transfer(userResponses[userEntered[x]].amount);
            }
        }

        }else{
            for(uint256 x ; x!=userEntered.length;x++){
                payable(userEntered[x]).transfer(userResponses[userEntered[x]].amount);
            }
        }

    }else{
        for(uint256 x ; x!=userEntered.length;x++){
            payable(userEntered[x]).transfer(userResponses[userEntered[x]].amount);
        }
    }

}

function getPrice(string memory _coinName) public view returns(int224) {
 int224  _price;
 _price = readBeaconValueWithId(dataFeedAddresses[_coinName]);
 return _price;
}

function startJoinList() public onlyOwner {
    require(!joinStatus);
    joinStatus=true;
    currentGame = gameStruct(allGames[gameIndex].name ,0, allGames[gameIndex].time);
}


}