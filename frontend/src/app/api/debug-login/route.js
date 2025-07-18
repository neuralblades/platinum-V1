import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// POST /api/debug-login - Debug login issues
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    
    

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const debugInfo = {
      userFound: !!user,
      userActive: user ? user.is_active : null,
      userRole: user ? user.role : null,
      providedEmail: email,
      normalizedEmail: email.toLowerCase().trim()
    };

    if (user) {
      // Test password
      const isValidPassword = await bcrypt.compare(password, user.password);
      debugInfo.passwordValid = isValidPassword;
      debugInfo.storedPasswordHash = user.password.substring(0, 20) + '...';
    }

    // Also test with a fresh hash of the provided password
    const testHash = await bcrypt.hash(password, 12);
    debugInfo.testHashCreated = testHash.substring(0, 20) + '...';

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}