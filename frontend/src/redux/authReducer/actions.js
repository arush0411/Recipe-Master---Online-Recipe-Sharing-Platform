import axios from "axios";
import {
  CREATE_USER_LOADING,
  CREATE_USER_ERROR,
  CREATE_USER_SUCCESS,
  LOGIN_USER_LOADING,
  LOGIN_USER_ERROR,
  LOGIN_USER_SUCCESS,
  POST_DISLIKE_SUCCESS,
  POST_LIKE_SUCCESS,
  RESET,
  UPDATE_USER_DETAILS,
  GET_LOGGEDUSER_LOADING,
  GET_LOGGEDUSER_SUCCESS,
  GET_LOGGEDUSER_ERROR,
} from "./actionTypes";

const API_URL = process.env.REACT_APP_API_URL;

// Create User
export const createUser = (newUser, toast, navigate) => async (dispatch) => {
  dispatch({ type: CREATE_USER_LOADING });

  try {
    const response = await axios.post(`${API_URL}/auth/signup`, newUser, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({ type: CREATE_USER_SUCCESS });
    toast({
      title: "Sign Up Successful",
      description: response.data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login");
  } catch (error) {
    dispatch({ type: CREATE_USER_ERROR });
    toast({
      title: "Sign Up Failed",
      description: error.response?.data?.message || "Something went wrong",
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  }
};

// Login User
export const loginUser = (userObj, toast, navigate) => async (dispatch) => {
  dispatch({ type: LOGIN_USER_LOADING });

  try {
    const response = await axios.post(`${API_URL}/auth/login`, userObj, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      dispatch({ type: LOGIN_USER_SUCCESS, payload: response.data.token });

      toast({
        title: "Login Successful",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/");
    }
  } catch (error) {
    dispatch({ type: LOGIN_USER_ERROR });
    toast({
      title: "Login Failed",
      description: error.response?.data?.message || "Invalid email or password.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

// Logout
export const logoutUser = (token, toast, navigate) => async (dispatch) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${API_URL}/auth/logout`, config);
    localStorage.removeItem("token");

    toast({
      title: "Logout Successful",
      description: response.data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    navigate("/");
  } catch (error) {
    toast({
      title: "Logout Failed",
      description: error.response?.data?.message || "Logout error",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }

  dispatch({ type: RESET });
};

// Get logged-in user data
export const getUserData = (token, toast) => async (dispatch) => {
  dispatch({ type: GET_LOGGEDUSER_LOADING });

  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = {
      ...response.data.user,
      profileImage: `${API_URL}/${response.data.user.profileImage}`,
    };

    dispatch({ type: GET_LOGGEDUSER_SUCCESS, payload: user });
  } catch (error) {
    dispatch({ type: GET_LOGGEDUSER_ERROR });
    toast({
      title: "Failed to Load User Details",
      description: error.response?.data?.message || "Could not fetch user info",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

// Update user details
export const updateUserDetails = (id, newData, headers, toast) => async (dispatch) => {
  try {
    const res = await axios.patch(`${API_URL}/users/update/${id}`, newData, {
      headers,
    });

    dispatch({
      type: UPDATE_USER_DETAILS,
      payload: res.data.updatedUser,
    });

    toast({
      title: "User Details Updated",
      description: res.data.status || "Update successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({
      title: "Update Failed",
      description: err.response?.data?.message || "An error occurred",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

// Get user's recipes
export const getUserRecipes = (id, token) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/recipe/getMyRecipe?populate=recipes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: "GET_USER_RECIPES",
      payload: res.data.recipes,
    });
  } catch (error) {
    console.error("Error fetching user recipes:", error);
  }
};

// Get all recipes
export const getAllRecipes = (token) => {
  return axios
    .get(`${API_URL}/recipe/getAllRecipe`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));
};
