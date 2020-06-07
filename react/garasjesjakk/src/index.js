import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCat } from '@fortawesome/free-solid-svg-icons';
import { faHorse } from '@fortawesome/free-solid-svg-icons';
import { faCrow } from '@fortawesome/free-solid-svg-icons';
import { faFish } from '@fortawesome/free-solid-svg-icons';
import { faDog } from '@fortawesome/free-solid-svg-icons';
import { faDragon } from '@fortawesome/free-solid-svg-icons';
import { faHippo } from '@fortawesome/free-solid-svg-icons';
import { faFrog } from '@fortawesome/free-solid-svg-icons';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

import './index.css';



/*  
    Setup - a component to tweak configuration parameters of the game
	
	Example of use inside the render method of the Game class:

		<Setup
			boardWidthOptions = {this.boardWidthOptions}
			boardWidth = {this.state.boardWidth}
			onBoardWidthChange = {(newBoardWidth) => this.handleBoardWidthChange(newBoardWidth)}
			
			boardHeightOptions = {this.boardHeightOptions}
			boardHeight = {this.state.boardHeight}
			onBoardHeightChange = {(newBoardHeight) => this.handleBoardHeightChange(newBoardHeight)}
			
			numPlayersOptions = {this.numPlayersOptions}
			numPlayers = {this.state.numPlayers}
			onNumPlayersChange = {(newNumPlayers) => this.handleNumPlayersChange(newNumPlayers)}
			
			playerIcons = { this.state.playerIcons }
			
			winConditionOptions = {this.winConditionOptions}
			winCondition = {this.state.winCondition}
			onWinConditionChange = {(newWinCondition) => this.handleWinConditionChange(newWinCondition)}
			
			groundRuleOptions = {this.groundRuleOptions}
			groundRule = {this.state.groundRule}
			onGroundRuleChange = {(newGroundRule) => this.handleGroundRuleChange(newGroundRule)}
			
			onSubmit={() => this.handleSetupSubmit()}
		/>	
*/
function Setup(props) {
	return (
		<div className="setup">
			<label htmlFor="boardWidthSelect">Bredde:</label><Select id="boardWidthSelect" isSearchable={ false } onChange={props.onBoardWidthChange} options={ props.boardWidthOptions } value={ props.boardWidth } />
			<label htmlFor="boardHeightSelect">Høyde:</label><Select id="boardHeightSelect" isSearchable={ false } onChange={props.onBoardHeightChange} options={ props.boardHeightOptions } value={ props.boardHeight } />
			<label htmlFor="numPlayersSelect">Antall spillere:</label><Select id="numPlayersSelect" isSearchable={ false } onChange={props.onNumPlayersChange} options={ props.numPlayersOptions } value={ props.numPlayers } />
			<SelectPlayerIcons handlePlayerIconChange={props.handlePlayerIconChange} availableIcons={ props.availableIcons } playerIcons={ props.playerIcons } />
			<label htmlFor="winConditionSelect">Vinner med:</label><Select id="winConditionSelect" isSearchable={ false } onChange={props.onWinConditionChange} options={ props.winConditionOptions } value={ props.winCondition } />
			<label htmlFor="groundRuleSelect">Grunnregel:</label><Select id="groundRuleSelect" isSearchable={ false } onChange={props.onGroundRuleChange} options={ props.groundRuleOptions } value={ props.groundRule } />
			<div className="startButton">
			<button onClick={props.onSubmit}>
				Start spill <FontAwesomeIcon title="Start spill" icon={faPlayCircle} />
			</button> 
			</div>
		</div>
	);
} // End Setup function



/* Selection of player icons */
function SelectPlayerIcons(props) {

	const iconCount = props.availableIcons.length;
    let selectButtons = props.playerIcons.map((u,i) => {
		const player = i;
		const icon_order = [];
		icon_order.push(props.playerIcons[i]);
		for (let j=0; j<iconCount; j++)  if (j !== props.playerIcons[i]) icon_order.push(j);
				
		return  <div key={ "iconSelectorPlayer" + (player + 1) }><div className="playerNumber">Spiller { player + 1 }</div><div className="iconSelector">{ icon_order.map((v,k) => { return <button key={"icon_" + player + "_" + v} onClick={k ? () => props.handlePlayerIconChange(player, v) : null} className={k ? "change" : "mine"}>{Game.PlayerIcon(props.availableIcons, v)}</button> })}</div></div>
	});

	return (
		<div className="playerIconSetup">
			{selectButtons}
		</div>
	);
} // End selection of player icons


/* Game state and win conditions */
class Game extends React.Component {

	static PlayerIcon(availableIcons, number, color) {
		if (!color) color="";
		return <FontAwesomeIcon color={color} title={availableIcons[number].title} icon={availableIcons[number].icon} />
	}


	// Constructor
	constructor(props) {
		super(props);
		
		this.availableIcons = [ { icon: faCat,
						  	      title: "Katt" }, 
							    { icon: faCrow,
				                  title: "Kråke" }, 
							    { icon: faHorse,
				                  title: "Hest" }, 
							    { icon: faFish,
				                  title: "Fisk" }, 
							    { icon: faDragon,
				                  title: "Drage" }, 
							    { icon: faDog,
				                  title: "Hund" }, 
							    { icon: faHippo,
				                  title: "Flodhest"}, 
							    { icon: faFrog,
				                  title: "Frosk"} ];
		
		this.boardWidthOptions = [...Array(Game.MAX_BOARD_SIZE-Game.MIN_BOARD_SIZE+1)].map((u, i) => { return { label: (i + Game.MIN_BOARD_SIZE) + " ruter bredt", value: i + Game.MIN_BOARD_SIZE }; });
		this.boardHeightOptions = [...Array(Game.MAX_BOARD_SIZE-Game.MIN_BOARD_SIZE+1)].map((u, i) => { return { label: (i + Game.MIN_BOARD_SIZE) + " ruter høyt", value: i + Game.MIN_BOARD_SIZE }; });
		this.numPlayersOptions = [...Array(Game.MAX_PLAYERS-Game.MIN_PLAYERS+1)].map((u, i) => { return { label: (i + Game.MIN_PLAYERS) + " spillere", value: i + Game.MIN_PLAYERS }; });
		this.winConditionOptions = [];
		this.setWinConditionOptions(this.boardWidthOptions[0].value, this.boardHeightOptions[0].value); // Setting win condition options based on smallest board size available for selection
		this.groundRuleOptions = [ { label: "Fritt valg av rute (aka. bondesjakk)", value: "1" }, { label: "Spillernes valg må bygge fra bunn og opp (aka. fire på rad)", value: "2"} ];
		
		let playerIcons = [];
		for (let i=0; i < this.numPlayersOptions[0].value; i++) {
		  playerIcons.push(i);
		}

		this.state = {
			history: [{
				squares: Array(Game.MIN_BOARD_SIZE * Game.MIN_BOARD_SIZE).fill(null), // History setup defaults to smallest possible board
			}],
			stepNumber: 0,
			nextPlayer: this.getNextPlayer(0), // Defaults to step 0
			boardWidth: this.boardWidthOptions[0], // Defaults to smallest possible board
			boardHeight: this.boardHeightOptions[0], // Defaults to smallest possible board
			numPlayers: this.numPlayersOptions[0], // Defaults to smallest possible number of players
			winCondition: this.winConditionOptions[0], // Defaults to smallest possible board
			groundRule: this.groundRuleOptions[0], // Defaults to "Bondesjakk" ground rules
			playerIcons: playerIcons.slice(),
			gameStarted: false,
			winner: null,
			hover: null,
			winnerSquares: null,
			showTrophy: false
		};

	} // End constructor
	
	// Helper function 
	getCurrentSquares() {
		return this.state.history[this.state.stepNumber].squares;
	}
	
	
	getPlayerIcons() {
		if (this.state.playerIcons !== null) {
			return this.state.playerIcons;
		} else {
			let playerIcons = [];
			for (let i=0; i < this.state.numPlayers.value; i++) {
			  playerIcons.push(i);
			}
			return playerIcons;
		}
	}
	
	getPlayerIcon(player) {
	  return this.state.playerIcons[player-1];
	}
	
	// Setting up the mutable win condition options array for the setup screen
	setWinConditionOptions(boardWidth, boardHeight) {
	    let greatestBoardDimension = boardWidth > boardHeight ? boardWidth : boardHeight;
		this.winConditionOptions = [];

		for (let i = 3; i <= greatestBoardDimension; i++) {
			let label = i + " på rad"
			this.winConditionOptions.push({ label: label, value: i });
		}

		if (typeof this.state !== "undefined" && typeof this.state.winCondition !== "undefined") {
		  if (this.state.winCondition.value > greatestBoardDimension) {
			this.setState({
			  winCondition: this.winConditionOptions[this.winConditionOptions.length - 1]
			});
		  }
		}
	}
	
	
	// Handling setup screen events
	handleBoardWidthChange(newBoardWidth) {
		this.setState({
			history: [{
				squares: Array(newBoardWidth.value * this.state.boardHeight.value).fill(null),
			}],
			boardWidth: newBoardWidth
		});
		this.setWinConditionOptions(newBoardWidth.value, this.state.boardHeight.value);
	}

	handleBoardHeightChange(newBoardHeight) {
		this.setState({
			history: [{
				squares: Array(this.state.boardWidth.value * newBoardHeight.value).fill(null),
			}],
			boardHeight: newBoardHeight
		});
		this.setWinConditionOptions(this.state.boardWidth.value, newBoardHeight.value);
	}

	handleNumPlayersChange(newNumPlayers) {
	
		let playerIcons = [];
		for (let i=0; i < newNumPlayers.value; i++) {
		  playerIcons.push(i);
		}

	
		this.setState({
			numPlayers: newNumPlayers,
			playerIcons: playerIcons.slice()
		});
	}
	
	handlePlayerIconChange(player, iconNum) {
		const playerIcons = this.getPlayerIcons();
		const playerIconCount = playerIcons.length;

		let prevIconOwner = null;
		for (let i=0; i<playerIconCount; i++) {
			if (playerIcons[i] === iconNum) prevIconOwner = i;
		}
		
		const newPlayerIcons = playerIcons.slice();
		if (prevIconOwner !== null)	{
			newPlayerIcons[prevIconOwner] = newPlayerIcons[player];
		}
		
		newPlayerIcons[player] = iconNum;
		
		this.setState({
			playerIcons: newPlayerIcons.slice()
		});		
	}

	handleWinConditionChange(newWinCondition) {
		this.setState({
			winCondition: newWinCondition
		});
	}

	handleGroundRuleChange(newGroundRule) {
		this.setState({
			groundRule: newGroundRule
		});
	}

	handleSetupSubmit() {
		this.setState( {
			gameStarted: true,
		});
	}	
	
	
	// Handle click events on game timeline (jumbing back and forth in a game)
	jumpTo(step) {
		// Calculating winner at this point in game
		let winnerSquares = this.calculateWinnerSquares(this.state.history[step].squares, true);
		let winner = winnerSquares ? this.state.history[step].squares[winnerSquares[0]] : null;
		let showTrophy = winner ? true : false;
		this.setState({
			stepNumber: step,
			nextPlayer: this.getNextPlayer(step),
			winner: winner,
			winnerSquares: winnerSquares,
			showTrophy: showTrophy
		});
	}


	// Restart game with same rules
	restartGame() {
		this.setState({
			stepNumber: 0,
			history: [{
				squares: Array(this.state.boardWidth.value * this.state.boardHeight.value).fill(null),
			}],
			nextPlayer: this.getNextPlayer(0),
			winner: null,
			winnerSquares: null,
			hover: null,
			showTrophy: false
		});
	}


	// Restart game with same rules
	newSetup() {
		this.restartGame();
		let playerIcons = [];
		for (let i=0; i < this.state.numPlayers.value; i++) {
		  playerIcons.push(i);
		}
		this.setState({
			playerIcons:  playerIcons.slice(),
			gameStarted: false,
		});
	}

	
	// Handle click events for squares on board
	handleSquareClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length -1];
		const squares = current.squares.slice();

		if (squares[i] || this.state.winnerSquares) {
			return;
		}
 
		squares[i] = this.state.nextPlayer;
		
		// Check for winner
		let winnerSquares = this.calculateWinnerSquares(squares, true);
		let winner = winnerSquares ? squares[winnerSquares[0]] : null;
		let showTrophy = winner ? true : false;
		
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			stepNumber: history.length,
			nextPlayer: this.getNextPlayer(history.length),
			winner: winner,
			winnerSquares: winnerSquares,
			hover: null,
			showTrophy: showTrophy
		});
	}

	handleSquareHover(i) {
		this.setState({
			hover: i
		});
	}

	
	// Calculates winners based on dynamic board size and win condition
	// NOTE! It's actually enough to calculate winner from the last pressed square; not needing to iterate through ALL squares
	// Iterating through all squares is needed only when looking at a board after jumping back to a certain stage
	// NOTE2! If you fill inn a "hole" in a series, checking only one square, the last one, won't find the victorious series!
	calculateWinnerSquares(squares, forceCalculation) {
		if (!squares) return null;
		if (!forceCalculation && this.state.winnerSquares) return this.state.winnerSquares;
		
		let start = 0;
		let stop = squares.length;
		
		// Iterate through each relevant square as a starting point to check if someone won
		for (let i = start; i < stop; i++) {
		
		    // Skip square if not filled in
			if (squares[i] === null) continue;
		
			let winnerSquares = null;
			// For each starting point, try out all directions ()
			let directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
			for (let j in directions) {
				winnerSquares = this.won(squares[i], i, squares, this.state.boardWidth.value, this.state.boardHeight.value, directions[j], [i], parseInt(this.state.winCondition.value));
				if (winnerSquares) {
					return winnerSquares;
				}
			};
		
		}

		// No winner
		return null;
	
	}
	
	
	// Recursive function to check for winners
	won(player, checkSquare, allSquares, width, height, searchDirection, checkedPath, winCondition) {
		
		// Win condition achieved! Exiting
		if (checkedPath.length === winCondition) {
			return checkedPath;
		}
		
		// Get current coordinate (x,y)
		// 0,0  1,0  2,0  3,0
		//
		// 0,1  1,1  2,1  3,1
		//
		// 0,2  1,2  2,2  3,2
        //
		// 0,3  1,3  2,3  3,3
		//
		let x = checkSquare % width;
		let y = parseInt(checkSquare / width);
		
		// Find next square
		switch (searchDirection) {
		  case 'N':
		    y--;
			break;
			
		  case 'NE':
		    y--;
			x++;
			break;
			
		  case 'E':
		    x++;
			break;
			
		  case 'SE':
		    y++;
			x++;
			break;
			
		  case 'S':
		    y++;
			break;
			
		  case 'SW':
		    y++;
			x--;
			break;
			
		  case 'W':
		    x--;
			break;
			
		  case 'NW':
		    y--;
			x--;
			break;
			
		  default:
			break;
		}
		
		// If next square exists and is picked by same player; go!
		if (y >= 0 && y < height && x >= 0 && x < width) {
		
			// Transform (x,y) back to square index
			let newSquare = (y * width) + x;
			
			// Check for player equality, add 1 to checked length, and recurse!
			if (allSquares[newSquare] === player) {
				checkedPath.push(newSquare);
				return this.won(player, newSquare, allSquares, width, height, searchDirection, checkedPath, winCondition)
			}		
		}
		
		return null;
	}
	


	// Calculates next player based on step number and number of players (maximum 4 is supported)
	getNextPlayer(step) {
	    let numPlayers = this.state ? this.state.numPlayers.value : Game.MIN_PLAYERS;
		return (step % numPlayers) + 1;
	}
	

	// Render game
	render() {

		// Show setup screen
		if (!this.state.gameStarted) {

			return (
				<div className="game">
				<div className="game-setup">
					<Setup
						boardWidthOptions = {this.boardWidthOptions}
						boardWidth = {this.state.boardWidth}
						onBoardWidthChange = {(newBoardWidth) => this.handleBoardWidthChange(newBoardWidth)}
						
						boardHeightOptions = {this.boardHeightOptions}
						boardHeight = {this.state.boardHeight}
						onBoardHeightChange = {(newBoardHeight) => this.handleBoardHeightChange(newBoardHeight)}
						
						numPlayersOptions = {this.numPlayersOptions}
						numPlayers = {this.state.numPlayers}
						onNumPlayersChange = {(newNumPlayers) => this.handleNumPlayersChange(newNumPlayers)}
						
						availableIcons = { this.availableIcons }
						playerIcons = { this.getPlayerIcons() }
						handlePlayerIconChange = { (player,icon) => this.handlePlayerIconChange(player,icon) }
						
						winConditionOptions = {this.winConditionOptions}
						winCondition = {this.state.winCondition}
						onWinConditionChange = {(newWinCondition) => this.handleWinConditionChange(newWinCondition)}
						
						groundRuleOptions = {this.groundRuleOptions}
						groundRule = {this.state.groundRule}
						onGroundRuleChange = {(newGroundRule) => this.handleGroundRuleChange(newGroundRule)}
						
						onSubmit={() => this.handleSetupSubmit()}
					/>
				</div>
				</div>
			);

		// Game time!
		} else {

			let jumpToOptions = this.state.history.map((step, move) => {
				return { label: move ? (this.state.history.length === move + 1 ? 'Siste trekk' : 'Trekk ' + move) : 'Start',
				         value: move };				
			});

			let status;
			if (this.calculateWinnerSquares(this.getCurrentSquares())) {
				status = <div><span>{Game.PlayerIcon(this.availableIcons, this.getPlayerIcon(this.state.winner))} vinner!</span> <span className="winner"><FontAwesomeIcon icon={faTrophy} /></span></div>;
				status = <div><span className="winner"><FontAwesomeIcon icon={faTrophy} /><FontAwesomeIcon icon={faTrophy} /><FontAwesomeIcon icon={faTrophy} /></span> <span>{Game.PlayerIcon(this.availableIcons, this.getPlayerIcon(this.state.winner))}</span> <span className="winner"><FontAwesomeIcon icon={faTrophy} /><FontAwesomeIcon icon={faTrophy} /><FontAwesomeIcon icon={faTrophy} /></span></div>;
			} else if (this.state.stepNumber === (this.state.boardWidth.value * this.state.boardHeight.value)) {
				status = 'Siste trekk. Ingen vinner.';
			} else {
				status = <span>Nå spiller {Game.PlayerIcon(this.availableIcons, this.getPlayerIcon(this.state.nextPlayer))}</span>;
			}

			return (
				<div className="game">
					<div className="game-board" onMouseLeave={() => { this.setState({ hover: null }); }}>
						<div className="status">
							{ status }
						</div>
						<div className="board-container">
							{ this.state.winner ? <Trophy showTrophy = { this.state.showTrophy } /> : '' }
							<Board 
								width = {this.state.boardWidth.value}
								height = {this.state.boardHeight.value}
								squares = {this.getCurrentSquares()}
								nextPlayer = {this.state.nextPlayer}
								playerIcons = {this.state.playerIcons}
								availableIcons = { this.availableIcons }
								groundRule = {this.state.groundRule}
								winnerSquares = {this.state.winnerSquares}
								onClick = {(i) => this.handleSquareClick(i)}
								onHover = {(i) => this.handleSquareHover(i)}
								hover = {this.state.hover}
							/>
						</div>
					</div>
					<div className="game-tools">
					    <button id="undoButton" disabled={!(this.state.stepNumber > 0)} onClick={() => this.jumpTo(this.state.stepNumber-1)}><FontAwesomeIcon title="Ett steg tilbake" icon={faUndo} /></button>
						<Select id="jumpToSelect" isSearchable={ false } onChange={(move) => this.jumpTo(move.value)} options={ jumpToOptions } value={ jumpToOptions[this.state.stepNumber] } />
						<button id="redoButton" disabled={!(this.state.stepNumber < (jumpToOptions.length - 1))} onClick={() => this.jumpTo(this.state.stepNumber+1)}><FontAwesomeIcon title="Ett steg fremover" icon={faRedo} /></button>
						<ul className="game-options">
							<li>
								<button onClick={() => this.restartGame()}>Spill på nytt <FontAwesomeIcon title="Start spill" icon={faSync} /></button>
							</li>
						</ul>
					</div>
					<div className="game-rules">
						<p>Spilleregler</p>
						<ul>
							<li>
								{ this.state.boardWidth.label } x { this.state.boardHeight.label } brett
							</li>
							<li>
								{ this.state.numPlayers.label }
							</li>
							<li>
								Vinner med { this.state.winCondition.label }
							</li>
							<li>
								{ this.state.groundRule.label }
							</li>
						</ul>
						<button onClick={() => this.newSetup()}>Velg andre regler <FontAwesomeIcon title="Nytt spill" icon={faCog} /></button>
					</div>					
				</div>
			);

		}
		
	} // End render Game
	

} 
// Setting some "static" properties
Game.MIN_BOARD_SIZE = 3;
Game.MAX_BOARD_SIZE = 10;
Game.MIN_PLAYERS = 2;
Game.MAX_PLAYERS = 4;
// End Game class


/* Board */
class Board extends React.Component {

	renderSquare(i) {
		return (
			<Square 
			    squares={this.props.squares}
				key={"square_"+i}
				square={i}
				width={this.props.width}
				height={this.props.height}
				groundRule={this.props.groundRule.value}
			    nextPlayer={this.props.nextPlayer}
				playerIcons = {this.props.playerIcons}
				availableIcons = { this.props.availableIcons }
				winnerSquares = {this.props.winnerSquares}
				onClick={ () => this.props.onClick(i) }
				onHover={ () => this.props.onHover(i) }
				hover={this.props.hover}
			/>
		);
	}

	render() {
		let rows = [];
		let square_id = 0;
		
		for (let i=0; i<this.props.height; i++) {
			let columns = [];
			for (let j=0; j<this.props.width; j++) {
				columns.push({ 
					col_num: j, 
					square_id: square_id
				});
				square_id++;
			}
			rows.push({
				row_num: i,
				columns: columns
			});
		}

		var board = rows.map(function (row) {
			let generated_columns = row.columns.map(function (column) {
				return this.renderSquare(column.square_id);
			}, this);
			return <div id={"row_"+row.row_num} key={"row_"+row.row_num} className="board-row">{generated_columns}</div>;
		}, this);
		return board;

	}

}


/*
	Square - a component to make each square interactive
	
	Example of use inside the render method of the Board class

		<Square 
			squares={this.props.squares}
			key={"square_"+i}
			square={i}
			width={this.props.width}
			height={this.props.height}
			groundRule={this.props.groundRule.value}
			nextPlayer={this.props.nextPlayer}
			winnerSquares = {this.props.winnerSquares}
			onClick={ () => this.props.onClick(i) }
		/>	
*/
class Square extends React.Component {

	render() {
	
		let hoverClass = '';
		if (this.props.winnerSquares && this.props.winnerSquares.includes(this.props.square)) {
			hoverClass = "winner ";
		}
		
		// If Bondesjakk rules, print all squares equal
		if (this.props.groundRule === "1") {
			hoverClass += !this.props.winnerSquares && this.props.squares[this.props.square] && (this.props.hover === this.props.square) ? "alreadyPlayed" : '';
			return (
				<div className="square">
				<button className={hoverClass} onMouseOver={this.props.onHover} onClick={this.props.onClick}>
					{this.props.squares[this.props.square] ? Game.PlayerIcon(this.props.availableIcons, this.props.playerIcons[this.props.squares[this.props.square]-1]) : (this.props.hover === this.props.square) && !this.props.winnerSquares ? Game.PlayerIcon(this.props.availableIcons, this.props.playerIcons[this.props.nextPlayer-1], 'red') : ' '}
				</button>
				</div>
			);
		}
			
		// If Fire på rad rules, do some adjustments based on current board status
		if (this.props.groundRule === "2") {
			
			//let x = props.square % props.width;
			let y = parseInt(this.props.square / this.props.width);
			let clickable = false;
			
			
			// Usable square if
			//  - square is on the lowest row and unoccupied (y + 1 == width and occupied)
			//  - square is on top of an already occupied square
			if (!this.props.squares[this.props.square] && (
					((y + 1 === this.props.height) && !this.props.squares[this.props.square]) ||
					((y + 1 < this.props.height) && this.props.squares[this.props.square + this.props.width])
				)
			){
				 clickable = true;
			}
			
			return (
				<div className="square">
				<button className={hoverClass} onMouseOver={ clickable ? this.props.onHover : null } onClick={clickable ? this.props.onClick : null }>
					{this.props.squares[this.props.square] ? Game.PlayerIcon(this.props.availableIcons, this.props.playerIcons[this.props.squares[this.props.square]-1]) : (this.props.hover === this.props.square) && clickable && !this.props.winnerSquares ? Game.PlayerIcon(this.props.availableIcons, this.props.playerIcons[this.props.nextPlayer-1], 'red') : ' '}
				</button>
				</div>
			);	
		}

	} // End render function

} // End Square class


class Trophy extends React.Component {


	render() {
		let classNames = "trophy";
		classNames += !this.props.showTrophy ? ' fadeTrophy' : '';	
		return (
			<div id="trophy" className={classNames}>
				<FontAwesomeIcon icon={faTrophy} />
			</div>
		);	

	} // End render function
	
	componentDidMount() {
		if (this.props.showTrophy) {
			setTimeout(function (){
				let wrapper = document.getElementById('trophy');
				wrapper.classList.add('fadeTrophy');
			}, 1);
		}
    }
	

} // End Trophy class

// Bootstrapping
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);




