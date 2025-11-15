const testForgotPassword = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'iisaquemaciela@gmail.com'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);

    if (data.token) {
      console.log('\n✅ Token gerado:', data.token);
      console.log('🔗 Link de reset:', `http://localhost:5173/reset-password?token=${data.token}`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

testForgotPassword();
