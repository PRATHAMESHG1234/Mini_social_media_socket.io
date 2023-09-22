import baseUrl from "@/utils/baseUrl";
import catchErrors from "@/utils/catchErrors";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, Message, Segment } from "semantic-ui-react";

const resetPage = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const [emailChecked, setEmailChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/reset`, { email });
      setEmailChecked(true);
    } catch (error) {
      setErrorMsg(catchErrors(error));
    }
    setLoading(false);
  };

  useEffect(() => {
    errorMsg !== null && setTimeout(setErrorMsg(null), 5000);
  }, [errorMsg]);

  return (
    <>
      {emailChecked ? (
        <Message
          attached
          icon="mail"
          header="Check Your Inbox"
          content="Please check your inbox for further instruction"
          success
        />
      ) : (
        <Message attached icon="settings" header="reset password" color="red" />
      )}
      <Form
        loading={loading}
        onSubmit={resetPassword}
        error={errorMsg !== null}
      >
        <Message error header="Oops!" content={errorMsg} />

        <Segment>
          <Form.Input
            fluid
            icon="mail outline"
            type="email"
            iconPosition="left"
            label="Email"
            placeholder="Enter email address"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <Button
            disabled={loading || email.length === 0}
            icon="configure"
            type="submit"
            color="orange"
            content="submit"
          />
        </Segment>
      </Form>
    </>
  );
};

export default resetPage;
