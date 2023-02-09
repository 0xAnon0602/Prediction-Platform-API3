import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Uik from '@reef-defi/ui-kit'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Fab } from '@mui/material';
import Grid from '@mui/material/Grid';
import contract from './contracts/Prediction.json';


export default function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const lightTheme = createTheme({
    palette: {
		mode: 'light',
	  },
  });





  const abi = contract.abi
  const contractAddress = contract.address
  const tempRPC = "https://rpc.ankr.com/eth_goerli"

  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [joinAmount,setJoinAmount]=useState()
  const [tab, setTab] = useState("Current Game")
  const [gameStatus,setGameStatus]=useState()
  const [coinName,setCoinName]=useState("")
  const [timeFor,setTimeFor]=useState("")
  const [joinStatus,setJoinStatus]=useState()
  const [currentCoin,setCurrentCoin]=useState("")
  const [currentStartPrice,setCurrentStartPrice]=useState("")
  const [currentTime,setCurrentTime]=useState("")
  const [queueCoin,setQueueCoin]=useState("")
  const [queueTime,setQueueTime]=useState("")
  const [currentPrice,setCurrentPrice]=useState("")
  const [queuPrice,setQueuePrice]=useState("")
  const [owner,setOwner]=useState("")
  const [upDown,setUpDown]=useState("UP")
  const [gameAmount,setGameAmount]=useState("")
  const [endTimestamp,setEndTimestamp]=useState("")
  const [timeLeftString,setTimeLeftString]=useState("")
  const [isEndable,setIsEndable]=useState()
  const [isQueueAvailable,setIsQueueAvailable]=useState()

  const[allLoading,setAllLoading]=useState(true)
  const[addGameLoading,setAddGameLoading]=useState(false)
  const[endGameLoading,setEndGameLoading]=useState(false)
  const[joinGameLoading,setJoinGameLoading]=useState(false)
  const[startJoinLoading,setStartJoinLoading]=useState(false)
  const[startGameLoading,setStartGameLoading]=useState(false)


  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(async() => {

    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };



    checkMetamaskAvailability();
	setAllLoading(true)
	await runAllFunction()
	setAllLoading(false)
	await timeLeft()


  }, []);


  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }	
  

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);

     } catch (error) {
      setIsConnected(false);
    }
  };

  const getGameStatus = async() => {
    const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)

	const finalValue = await tempContract.gameStatus()
	setGameStatus(finalValue)
  }

  const getJoinStatus = async() => {
    const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)

	const finalValue = await tempContract.joinStatus()
	setJoinStatus(finalValue)
  }

  const getCurrentGameInfoFunction = async() => {
    const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const finalValue = await tempContract.currentGame()
	const _gameStatus = await tempContract.gameStatus()
	const _joinStatus = await tempContract.joinStatus()

	if(_gameStatus||_joinStatus){
	setCurrentCoin(finalValue['name'])
	setCurrentStartPrice((Number(ethers.utils.formatEther(finalValue['startPrice']))).toFixed(2))
	setCurrentTime(getTimeFunction(finalValue['time']))
	setCurrentPrice(await getPriceFunction(finalValue['name']))
	}
  }

  const getQueueGameInfoFunction = async() => {

    const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const indexQueueTemp = Number(await tempContract.gameIndexQueue())
	const indexTemp = Number(await tempContract.gameIndex())
	const _gameStatus = await tempContract.gameStatus()
	const _joinStatus = await tempContract.joinStatus()

	if(_gameStatus||_joinStatus){
		if(indexQueueTemp-indexTemp==1){
			setIsQueueAvailable(false)
		}else{
			setIsQueueAvailable(true)
			const finalValue = await tempContract.allGames(indexTemp+1)
			setQueueCoin(finalValue['name'])
			setQueueTime(getTimeFunction(finalValue['time']))
			setQueuePrice(await getPriceFunction(finalValue['name']))
		}
	}else{
		if(indexQueueTemp-indexTemp==0){
			setIsQueueAvailable(false)
		}else{
			setIsQueueAvailable(true)
			const finalValue = await tempContract.allGames(indexTemp)
			setQueueCoin(finalValue['name'])
			setQueueTime(getTimeFunction(finalValue['time']))
			setQueuePrice(await getPriceFunction(finalValue['name']))
		}
	}

  }
  
  const getPriceFunction = async(_coinName) => {
    const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const finalValue = (Number(ethers.utils.formatEther((await tempContract.getPrice(_coinName))))).toFixed(2)
	return finalValue
  }

  const getTotalGameAmountFunction = async() => {
	const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const finalValue = (Number(ethers.utils.formatEther((await tempContract.totalGameAmount())))).toFixed(5)
	setGameAmount(finalValue)
  }

  const getEndTimestampFunction = async() => {
	const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const finalValue = ((await tempContract.endTimestamp()).toNumber())

	const timeNow = parseInt(Date.now()/1000)
	if(timeNow>finalValue){setIsEndable(true)}
	else{setIsEndable(false)}
	setEndTimestamp(finalValue)
  }

  const getOwnerFunction = async()=> {
	const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const finalValue = await tempContract.owner()
	setOwner(finalValue)
  }


  const runAllFunction = async() => {

	await getGameStatus()
	await getJoinStatus()
	await getOwnerFunction()
	await getEndTimestampFunction()
	await getTotalGameAmountFunction()
	await getCurrentGameInfoFunction()
	await getQueueGameInfoFunction()

  }

  const timeLeft = async() =>{
	const provider = new ethers.providers.JsonRpcProvider(tempRPC, 5);
	const tempContract = new ethers.Contract(contractAddress,abi,provider)
	const _endTimestamp = ((await tempContract.endTimestamp()).toNumber())
	while(true){
	if(!isEndable){
	const timeNow = parseInt(Date.now()/1000)
	const timestampLeft =_endTimestamp-timeNow
	const minutes = Math.floor(timestampLeft / 60)
	const seconds = timestampLeft - minutes * 60
	if(minutes>=1){
		var finalValue = `${minutes}min ${seconds}sec`
	}else{
		var finalValue = `${seconds}sec`
	}
	setTimeLeftString(finalValue)
	if(timeNow>_endTimestamp){setIsEndable(true)}
	}
	await sleep(1*1000)
	}

  }

  const getTimeFunction = (_time) => {
	const minutes = Math.floor(_time / 60)
	const seconds = _time - minutes * 60
	if(minutes>=1){
		var finalValue = `${minutes}min ${seconds}sec`
	}else{
		var finalValue = `${seconds}sec`
	}
	return finalValue
  }

  const endGameFunction = async() => {
	setEndGameLoading(true)
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const tempContract = new ethers.Contract(contractAddress,abi,signer)
	const tx = await tempContract.endGame()

	Uik.notify.info({
		message: 'Waiting for the transaction to get confirmed!',
		aliveFor: 4
		})
	let receipt = await tx.wait()	
	console.log(receipt)
	Uik.notify.success({
		message: 'Transaction went through successfully!',
		aliveFor: 4
	  })
	  setEndGameLoading(false)
	runAllFunction()
  }

  const addGameFunction = async() => {
	setAddGameLoading(true)
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const tempContract = new ethers.Contract(contractAddress,abi,signer)
	const tx = await tempContract.addGame(coinName,timeFor)
	Uik.notify.info({
		message: 'Waiting for the transaction to get confirmed!',
		aliveFor: 4
		})
	let receipt = await tx.wait()	
	console.log(receipt)
	Uik.notify.success({
		message: 'Transaction went through successfully!',
		aliveFor: 4
	  })
	setAddGameLoading(false)
	 getQueueGameInfoFunction()
  }

  const startGameFunction = async() => {
	setStartGameLoading(true)
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const tempContract = new ethers.Contract(contractAddress,abi,signer)
	const tx = await tempContract.startGame()

	Uik.notify.info({
		message: 'Waiting for the transaction to get confirmed!',
		aliveFor: 4
		})
	let receipt = await tx.wait()	
	console.log(receipt)
	Uik.notify.success({
		message: 'Transaction went through successfully!',
		aliveFor: 4
	  })
	  setStartGameLoading(false)
	   setGameStatus(true)
	   getCurrentGameInfoFunction()
	   getQueueGameInfoFunction()


  }


  const startJoinFunction = async() => {
	setStartJoinLoading(true)
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const tempContract = new ethers.Contract(contractAddress,abi,signer)
	const tx = await tempContract.startJoinList()

	Uik.notify.info({
		message: 'Waiting for the transaction to get confirmed!',
		aliveFor: 4
		})
	let receipt = await tx.wait()	
	console.log(receipt)
	Uik.notify.success({
		message: 'Transaction went through successfully!',
		aliveFor: 4
	  })
	  setStartJoinLoading(false)
	   setGameStatus(false)
	   setJoinStatus(true)
	   getCurrentGameInfoFunction()
	   getQueueGameInfoFunction()
	
  }

  const joinGameFunction = async(_choice,_amount) => {
	setJoinGameLoading(true)
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const tempContract = new ethers.Contract(contractAddress,abi,signer)
	_amount=String(_amount*10**18)
	const tx = await tempContract.joinGame(_choice,_amount,{ value: _amount })

	Uik.notify.info({
		message: 'Waiting for the transaction to get confirmed!',
		aliveFor: 4
		})
	let receipt = await tx.wait()	
	console.log(receipt)
	Uik.notify.success({
		message: 'Transaction went through successfully!',
		aliveFor: 4
	  })
	  setJoinGameLoading(false)
	   getTotalGameAmountFunction()
	
	}





  return (
    <div>

<ThemeProvider theme={darkTheme}>
      <CssBaseline />
    
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div"   sx={{ flexGrow: 1 }}>
            Prediction Platform
          </Typography>
          <div>
          {isConnected ? (
            <>
          <Fab variant="extended" color="success">           
            Connected as {accountAddress.slice(0, 4)}...{accountAddress.slice(38, 42)}
          </Fab>
            </>
          ):
          (
            <>
          <Fab variant="extended" onClick={
              connectWallet
           }>           
            Connect
          </Fab>
              </>
          )}
        </div>

        </Toolbar>
      </AppBar>
    </Box>

</ThemeProvider>



    <Grid
  container
  direction="column"
  justifyContent="center"
  alignItems="center"
  style={{minHeight:"100vh" , minWidth:"100vh"}}
  >

<ThemeProvider theme={lightTheme}>
		<CssBaseline />


	<>
	<Box sx={{ minWidth: 500  }}>
	<Card variant="outlined">
	<React.Fragment>
	  <CardContent>
  

		<Uik.Tabs
		value={tab}
		onChange={value => setTab(value)}
		options={["Current Game", "Queue Game", "Add Game"]}
			/>
  
		<br></br>

	{!allLoading?(

		<>

{tab === "Current Game" ? (
	<>
	{gameStatus || joinStatus ? (
		<>
		<Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	    >

		<Uik.Text text={currentCoin.toLocaleUpperCase()}type='headline'/>
		</Grid>

		{gameStatus ? (
		<>
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
		<Uik.Button text={'START PRICE -> $'+currentStartPrice} neomorph/>
		</Grid>


		</>
		):(
		<></>
		)}
  
		
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }} > 
		<Uik.Button text={'CURRENT PRICE ->  $'+currentPrice} neomorph/>
		</Grid>
		
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
		<Uik.Button text={'TOAL GAME AMOUNT -> '+gameAmount+" ETH"} neomorph/>
		</Grid>
		 
		{!gameStatus && joinStatus ? (
		<>
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
		<Uik.Button text={'TIME -> '+currentTime} neomorph/>
		</Grid>
		</>):(
		<></>
		)}

		{gameStatus ? (
		<>
		{isEndable ? (
			<>

		{!endGameLoading ? (

			<>
			<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
			<Uik.Button text='End Game' size='small' 
				onClick={ async() => {
					if(isConnected){
					await endGameFunction()
					}else{
						Uik.notify.danger({
							message: 'Please connect your wallet first!',
							aliveFor: 2
						})
					}
				}}
			/>
			</Grid>
			</>):(
				<>
				<Uik.Loading color='black'/>	
				</>
			)}

			<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
			<Uik.Tag color="green" text="Please end the game as the time is already over!"/>
			</Grid>
			
			</>
			):(
			<>	
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
		<Uik.Button text={'TIME LEFT -> '+timeLeftString} neomorph/>
		</Grid>
			
			</>
			)}
		</>
		):(
		<>
		</>
		)}
  

		{joinStatus ? (
		<>
				  <Grid container direction="row" alignItems="center" justifyContent="center" maxWidth="200px" 
		style={{minWidth:"15vh" , marginLeft:"30%"}} sx={{ mb: 2 }} 
		>

		<Uik.Tabs
			value={upDown}
			onChange={value => setUpDown(value)}
			options={["UP", "DOWN"]}
		/>

  		</Grid>


		  <Grid container direction="row" alignItems="center" justifyContent="center" maxWidth="200px" 
		style={{minWidth:"15vh" , marginLeft:"30%"}} sx={{ mb: 1.5 }} 
		>

		<Uik.Input
			defaultValue={"Enter Join Amount"}
			onInput={e => setJoinAmount(e.target.value)}
		/>		

  		</Grid>

{!joinGameLoading ? (
		<>	
		<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 0.5 }} >
		<Uik.Button text='Join Game' size='small' 
					onClick={ async() => {
						if(isConnected){
						if (upDown==="UP"){var _choice=true}
						else if(upDown==="DOWN"){var _choice=false}
						await joinGameFunction(_choice,joinAmount)						
					}else{
						Uik.notify.danger({
							message: 'Please connect your wallet first!',
							aliveFor: 2
						})
						}
					}}
					
				/>
		</Grid>
		</>):(
		<>
		<Uik.Loading color='black'/>	
		</>)}
		</>
		):(<></>)}




		{owner.toLocaleLowerCase()===accountAddress && !gameStatus ? (
		<>
{!startGameLoading ? (
			<>
		<Grid container direction="row" alignItems="center" justifyContent="center" >
		<Uik.Button text='Start Game' size='small' 
					onClick={ async() => {
						if(isConnected){
						await startGameFunction()						
					}else{
						Uik.notify.danger({
							message: 'Please connect your wallet first!',
							aliveFor: 2
						})
						}
					}}		
					/>
		</Grid>
		</>
		):(
		<>
		<Uik.Loading color='black'/>	
		</>)}
		</>
		):(
		<>
		{!gameStatus ? (
			<>
			<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
			<Uik.Tag color="green" text="Ask the owner to start the game!"/>
			</Grid>
			</>
		):(
		<>
		</>
		)}

		</>)}


		<Grid container direction="row" alignItems="center" justifyContent="center">

		</Grid>

		
	
		  </>
		):(
			<>
			<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
				<Uik.Tag color="red" text="No game is started yet!"/>
			</Grid>
			<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
				<Uik.Tag color="red" text="Please ask the admin to start the event!"/>
			</Grid>
			</>
		)}
		</>
	):(
		<>
		</>
	)}



{tab === "Queue Game" ? (
	<>
	{isQueueAvailable ? (
		<>
		<Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	  >
			<Uik.Text text={queueCoin.toLocaleUpperCase()} type='headline'/>
		</Grid>
		  

		<Grid container direction="row" alignItems="center" justifyContent="center">
		<Uik.Button text={'CURRENT PRICE ->  $'+queuPrice} neomorph/>
		</Grid>


		<Grid container direction="row" alignItems="center" justifyContent="center">
		<Uik.Button text={"TIME -> "+ queueTime} neomorph/>
		</Grid>
		
		  <br></br>
  
		{gameStatus || joinStatus ? (<>
			<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
				<Uik.Tag color="red" text="Game is already in progress!"/>
			</Grid>
		
		</>):(
		<>

{!startJoinLoading ? (
			<>
		{owner.toLocaleLowerCase()===accountAddress && !gameStatus ? (
			<>
			<Grid container direction="column" alignItems="center" justifyContent="center" >
			
			<Uik.Button text='Start Join List' size='small' 
					onClick={ async() => {
						if(isConnected){
						await startJoinFunction()						
					}else{
						Uik.notify.danger({
							message: 'Please connect your wallet first!',
							aliveFor: 2
						})
						}
					}}					
					/>

			</Grid>
			</>):(
			<>
			<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
			<Uik.Tag color="green" text="Ask the owner to start join list of the game!"/>
			</Grid>
			</>
			)}
			</>):(
			<>		
				<Uik.Loading color='black'/>	
			</>)}
		</>
		) }

		</>
		):(
		<>
			<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
				<Uik.Tag color="red" text="There is no game available in queue!"/>
			</Grid>

			<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
				<Uik.Tag color="red" text="Please ask the owner to add more game!"/>
			</Grid>
		</>
		)}
	</>
		):(
			<>
			</>
		)}
  

{tab === "Add Game" ? (
		<>


		<Grid container direction="row" alignItems="center" justifyContent="center" maxWidth="200px" 
		style={{minWidth:"15vh" , marginLeft:"30%"}} sx={{ mb: 2.5 }}	 
		>
		<Uik.Input
			label='Coin Name'
			defaultValue={"Enter Coin Name"}
			onInput={e => setCoinName(e.target.value)}
		/>		
  		</Grid>


		<Grid container direction="row" alignItems="center" justifyContent="center" maxWidth="200px" 
		style={{minWidth:"15vh" , marginLeft:"30%"}} 
		>
		<Uik.Input
			label='Time'
			defaultValue={"Enter Time for Game"}
			onInput={e => setTimeFor(e.target.value)}
		/>		
  		</Grid>


		
		  <br></br>
  
	{!addGameLoading ? (
			<>

{owner.toLocaleLowerCase()===accountAddress ? (
			<>
			  <Grid container direction="column" alignItems="center" justifyContent="center" >
				
				<Uik.Button text='Add Game' size='small' 
					onClick={ async() => {
						if(isConnected){
						await addGameFunction()						
					}else{
						Uik.notify.danger({
							message: 'Please connect your wallet first!',
							aliveFor: 2
						})
						}
					}}						
					/>

				
			  </Grid>
			</>):(
			<>
			<Grid container direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.2 }}>
			<Uik.Tag color="green" text="Ask the owner to add more games!"/>
			</Grid>
			</>
			)}
	
			</>):(
				<>
				  <Uik.Loading color='black'/>
				</>
			)
	}


		  </>
		):(
			<>
			</>
		)}

</>):(
	<>
	  <Uik.Loading color='black' size='big' text='Loading data from blockchain...'/>
	</>
)}

	  </CardContent>
  
	</React.Fragment>
	</Card>
	</Box>
	</>





</ThemeProvider>

    </Grid>     


      
  </div>
  );
}