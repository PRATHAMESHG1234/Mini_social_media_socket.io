import baseUrl from "@/utils/baseUrl";
import catchErrors from "@/utils/catchErrors";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Form, Message, Segment } from "semantic-ui-react";

const tokenPage = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState({ feild1: "", feild2: "" });
  const { feild1, feild2 } = newPassword;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    errorMsg !== null && setTimeout(setErrorMsg(null), 5000);
  }, [errorMsg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassword((prev) => ({ ...prev, [name]: value }));
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (feild1 !== feild2) {
        return setErrorMsg("Passwords do not match");
      }

      await axios.post(`${baseUrl}/api/reset/token`, {
        newPassword: feild1,
        token: router.query.token,
      });

      setSuccess(true);
    } catch (error) {
      setErrorMsg(catchErrors(error));
    }
    setLoading(false);
  };
  return (
    <>
      {success ? (
        <Message
          attached
          success
          size="large"
          icon="check"
          header="Password reset successfull"
          content="login again"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/login")}
        />
      ) : (
        <Message attached icon="settings" header="reset password" color="red" />
      )}
      {!success && (
        <Form
          loading={loading}
          onSubmit={resetPassword}
          error={errorMsg !== null}
        >
          <Message error header="Oops!" content={errorMsg} />

          <Segment>
            <Form.Input
              fluid
              icon="eye"
              type="password"
              iconPosition="left"
              label="New Password"
              placeholder="Enter New Password"
              name="feild1"
              onChange={handleChange}
              value={feild1}
              required
            />
            <Form.Input
              fluid
              icon="eye"
              type="password"
              iconPosition="left"
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              name="feild2"
              onChange={handleChange}
              value={feild2}
              required
            />

            <Button
              disabled={loading || feild1 === "" || feild2 === ""}
              icon="configure"
              type="submit"
              color="orange"
              content="submit"
            />
          </Segment>
        </Form>
      )}
    </>
  );
};

export default tokenPage;
