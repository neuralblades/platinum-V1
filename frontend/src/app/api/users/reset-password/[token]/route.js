import { NextResponse } from 'next/server';
import supabase from '../../../../../../lib/supabase';
import bcrypt from 'bcryptjs';

// POST /api/users/reset-password/[token]
export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const { password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'New password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, reset_token_expiry')
      .eq('reset_token', token)
      .eq('is_active', true)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(user.reset_token_expiry);
    
    if (now > expiryDate) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while resetting your password',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}