import { useState, useRef, useEffect } from 'react';
import TabStrip from './TabStrip';
import Button from './Button';
import { useAuthUpdate } from '../contexts/AuthContext';

//const registrationEndpoint = "http://www.lanis.co.uk/php/register";
const registrationEndpoint = "http://www.jaab.dev/api/register";
const loginEndpoint = "http://www.jaab.dev/api/login";
//const loginEndpoint = "http://www.lanis.co.uk/php/login";

function tokenUser(token) {
  let tokenPayload = token.split('.')[1];
  let decodedPayload = atob(tokenPayload);
  let user = JSON.parse(decodedPayload);
  return user;
}

function Login() {
  //#region hooks
  // contexts
  const authUpdate = useAuthUpdate();

  // states
  const [selectedTab, setSelectedTab] = useState("Login");
  const [errorMessage, setErrorMessage] = useState(null);

  // refs
  const userNameRef = useRef();
  const pinRef = useRef();
  const pinConfirmationRef = useRef();

  // effects
  useEffect(() => {
    setErrorMessage(null);
  },[selectedTab]);
  //#endregion hooks

  function handlePinKeypress(e) {
    e.key === "Enter" && handleFormSubmit();
  }

  function validateForm(form) {
    const {username, pin, confirmPin: confirm} = form;
    const usernameRE = /^[a-zA-Z0-9]*$/;
    const pinRE = /^[0-9]*$/;

    if (!username) return "Please provide a username";
    if (!usernameRE.test(username)) return "Username invalid. Only letters and numbers allowed.";

    if (!pin) return "Please enter a PIN";
    if (!pinRE.test(pin)) return "Only numeric PINs please";
    if (pin.length < 4) return "PIN too short. Use at least 4 digits.";
    if ((!!confirm || confirm === "") && (pin === "1234" || pin === "0000")) return "Come on now...";

    if (confirm === "") return "Please confirm the PIN";
    if (!!confirm && confirm !== pin) return "PINs don't match";


    return null;
  }
  
  function handleFormSubmit(e) {
    setErrorMessage(null);
    let register = selectedTab === "Register";
    let pinConfirmationBody = register ? {confirmPin: pinConfirmationRef.current.value} : {};
    let requestBody = {
      username: userNameRef.current.value,
      pin: pinRef.current.value,
      ...pinConfirmationBody
    };
    let err = validateForm(requestBody);
    if (err) {
      setErrorMessage(err);
      return;
    }
    register ? handleRegistration(requestBody) : handleLogin(requestBody);
  }

  async function handleRegistration(requestBody) {
    try {
      let response = await fetch(registrationEndpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (response.status === 200) {
        let loginBody = {
          username: requestBody.username,
          pin: requestBody.pin
        };
        handleLogin(loginBody);
      } else {
        let errMsg = "Failed to register.";
        if (response.status === 409) errMsg += " Username already taken.";
        if (response.status === 404) errMsg += " User not found.";
        setErrorMessage(errMsg);
      }
    } catch {
      setErrorMessage("Failed to contact server");
    }
  }

  async function handleLogin(requestBody) {
    try {
      let response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 200) {
        let processedResponse = await response.json();
        authUpdate({
          user: tokenUser(processedResponse),
          token: processedResponse
        });
        setErrorMessage(null);
      } else {
        authUpdate(null);
        let errMsg = "Failed to log in";
        setErrorMessage(errMsg);
      }
      
    } catch {
      authUpdate(null);
      setErrorMessage("Failed to contact server");
    }
  }

  //#region styles
  const divStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "90vh",
    maxWidth: "200px",
    margin: "0 auto"
  };
  const labelStyle = {
    alignSelf: "start",
    color: "#444",
    marginTop: "10px"
  };
  const inputStyle = {
    width: "100%"
  };
  const errorStyle = {
    color: "red",
    marginTop: "10px",
    textAlign: "center"
  };
  //#endregion

  return (
    <form onSubmit={handleFormSubmit}>
      <div style={divStyle}>
        <TabStrip tabs={["Login","Register"]} selectedTab={selectedTab} clickTab={setSelectedTab}/>
        <label htmlFor="username" style={labelStyle}>Username</label>
        <input type="text" id="username" style={inputStyle} ref={userNameRef} onKeyPress={handlePinKeypress}></input>
        <label htmlFor="pin" style={labelStyle}>PIN</label>
        <input type="password" id="pin" style={inputStyle} ref={pinRef} onKeyPress={handlePinKeypress}></input>
        {
          selectedTab === "Register" ?
          <>
            <label htmlFor="confirmPin" style={labelStyle}>Confirm PIN</label>
            <input type="password" id="pin" style={inputStyle} ref={pinConfirmationRef} onKeyPress={handlePinKeypress}></input>
          </>
          : null
        }
        <div style={errorStyle}>
          {errorMessage && errorMessage}
        </div>
        <Button caption={selectedTab === "Register" ? "Register" : "Log In"} onClick={handleFormSubmit}/>
      </div>
    </form>
  );
}

export default Login;