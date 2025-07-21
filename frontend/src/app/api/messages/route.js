import { NextResponse } from 'next/server';

// GET /api/messages - Get all messages/contact submissions (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    
    

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { subject: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { message: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Message.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Messages API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch messages',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}