import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { randomBytes } from 'crypto';

// POST /api/users/forgot-password
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (fetchError || !user) {
      // For security, always return success even if user doesn't exist
      return NextResponse.json({
        success: true,
        message: 'If the email exists in our system, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // In a real application, you would send an email here
    // For now, we'll just log the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // TODO: Implement email sending
    // await sendPasswordResetEmail(email, user.name, resetLink);

    return NextResponse.json({
      success: true,
      message: 'If the email exists in our system, you will receive a password reset link.',
      // Include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetLink })
    });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}