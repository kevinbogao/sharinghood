function clearLocalStorage() {
  localStorage.removeItem("@sharinghood:accessToken");
  localStorage.removeItem("@sharinghood:refreshToken");
  localStorage.removeItem("@sharinghood:selCommunityId");
}

export { clearLocalStorage };
