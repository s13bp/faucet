$(document).ready(function() {

	//////////////////////////////////////////////////////////////////////////////
	////     INSERT YOUR NODE RPC URL, NETWORK ID AND GAS PRICE HERE        //////
	//////////////////////////////////////////////////////////////////////////////
	var rpcURL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
	var networkID = 97;
	var minGasPrice = 20000000000;
	//////////////////////////////////////////////////////////////////////////////
	////     INSERT THE TOKEN AND FAUCET ADDRESS HERE                       //////
	//////////////////////////////////////////////////////////////////////////////
	var token_address = '0xCd43BC801977Dd0f47862a0AFF44412f0CA98864';
	var faucet_address = '0xdc92C805FA8275A07e65965beBD8fab4f85e12f0';
	//////////////////////////////////////////////////////////////////////////////

	var account;
	var web3Provider;

	var contract_token;
	var contract_faucet;

	var balanceETH = 0;
	var balanceToken = 0;

	function initialize() {
		setAccount();
		setTokenBalance();
		checkFaucet();
		checkFaucetG();
	}

	function setAccount() {
		web3.version.getNetwork(function(err, netId) {
			if (!err && netId == networkID) { 
				$("#wrong_network").fadeOut(1000);
				setTimeout(function(){ $("#correct_network").fadeIn(); $("#faucet").fadeIn(); }, 1000);
				account = web3.eth.accounts[0];
				$("#address").text(account);
				web3.eth.getBalance(account, function(err, res) {
					if(!err) {
						balanceETH = Number(web3.fromWei(res, 'ether'));
						$('#balanceETH').text(balanceETH + " ETH");
						$('#balanceETH').show();
					}
				});
			} 
		});
	}

	function setTokenBalance() {
		contract_token.balanceOf(web3.eth.accounts[0], function(err, result) {
			if(!err) {
				$('#balanceToken').text(web3.fromWei(balanceToken, 'ether') + " Tokens");
				if(Number(result) != balanceToken) {
					balanceToken = Number(result);
					$('#balanceToken').text(web3.fromWei(balanceToken, 'ether') + " Tokens");
				}
			}
		});
	}

	function checkFaucet() {
		var tokenAmount = 0;
		contract_faucet.tokenAmount(function(err, result) {
			if(!err) {
				tokenAmount = result;
				$("#requestButton").text("Request " + web3.fromWei(result, 'ether') + " Test Tokens");
			}
		});

		contract_token.balanceOf(faucet_address, function(errCall, result) {
			if(!errCall) {
				if(result < tokenAmount) {
					$("#warning").html("Sorry - the faucet is out of tokens! But don't worry, we're on it!")
				} else {
					contract_faucet.allowedToWithdraw(web3.eth.accounts[0], function(err, result) {
						if(!err) {
							if(result && balanceToken < tokenAmount*1000) {
								$("#requestButton").removeAttr('disabled');
							} else {
								contract_faucet.waitTime(function(err, result) {
									if(!err) {
										$("#warning").html("Sorry - you can only request tokens every " + (result)/60 + " minutes. Please wait!")
									}
								});
							}	
						}
					});
				}
			}
		});
	}

	function checkFaucetG() {
		var tokenAmountG = 0;
		contract_faucet.tokenAmountG(function(err, result) {
			if(!err) {
				tokenAmountG = result;
				$("#requestButtonz").text("Request " + web3.fromWei(result, 'ether') + " Test Tokens - WL");
			}
		});

		contract_token.balanceOf(faucet_address, function(errCall, result) {
			if(!errCall) {
				if(result < tokenAmountG) {
					$("#warning").html("Sorry - the faucet is out of tokens! But don't worry, we're on it!")
				} else {
					contract_faucet.allowedToWithdraw(web3.eth.accounts[0], function(err, result) {
						if(!err) {
							if(result && balanceToken < tokenAmountG*1000) {
								$("#requestButtonz").removeAttr('disabled');
							} else {
								contract_faucet.waitTime(function(err, result) {
									if(!err) {
										$("#warning").html("Sorry - you can only request tokens every " + (result)/60 + " minutes. Please wait!")
									}
								});
							}	
						}
					});
				}
			}
		});
	}

	function getTestTokens() {
		$("#requestButton").attr('disabled', true);
		web3.eth.getTransactionCount(account, function(errNonce, nonce) {
			if(!errNonce) {
				contract_faucet.requestTokens({value: 0, gas: 1000000, gasPrice: minGasPrice, from: account, nonce: nonce}, function(errCall, result) {
					if(!errCall) {
						testTokensRequested = true;
						$('#getTokens').hide();
					} else {
						testTokensRequested = true;
						$('#getTokens').hide();
					}
				});
			}
		});
	}
	function getTestTokenz() {
		$("#requestButtonz").attr('disabled', true);
		web3.eth.getTransactionCount(account, function(errNonce, nonce) {
			if(!errNonce) {
				contract_faucet.whiteRequest({value: 0, gas: 1000000, gasPrice: minGasPrice, from: account, nonce: nonce}, function(errCall, result) {
					if(!errCall) {
						testTokenzRequested = true;
						$('#getTokens').hide();
					} else {
						testTokenzRequested = true;
						$('#getTokens').hide();
					}
				});
			}
		});
	}

	$("#rpc_url").text(rpcURL);
	$("#network_id").text(networkID);

	if (typeof web3 !== 'undefined') {
		web3Provider = web3.currentProvider;
	}

	web3 = new Web3(web3Provider);

	$.getJSON('json/erc20.json', function(data) {
		contract_token = web3.eth.contract(data).at(token_address);
	});
	$.getJSON('json/faucet.json', function(data) {
		contract_faucet = web3.eth.contract(data).at(faucet_address);
	});

	setTimeout(function(){ initialize(); }, 1000);

	let tokenButton = document.querySelector('#requestButton');
	tokenButton.addEventListener('click', function() {
		getTestTokens();
	});
	let tokenButtonz = document.querySelector('#requestButtonz');
	tokenButtonz.addEventListener('click', function() {
		getTestTokenz();
	});
});