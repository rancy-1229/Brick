"""add_pending_to_tenant_status_enum

Revision ID: a2a4d4e49528
Revises: ea9b0eddc8fa
Create Date: 2025-09-04 09:36:11.856496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2a4d4e49528'
down_revision: Union[str, None] = 'ea9b0eddc8fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 添加 'pending' 到 tenant_status 枚举
    op.execute("ALTER TYPE tenant_status ADD VALUE 'pending'")
    
    # 提交事务，使新的枚举值可用
    op.execute("COMMIT")
    
    # 更新默认值为 'pending'
    op.alter_column('tenants', 'status', 
                   server_default='pending',
                   schema='public')


def downgrade() -> None:
    # 注意：PostgreSQL 不支持从枚举中删除值
    # 这里只能将默认值改回 'active'
    op.alter_column('tenants', 'status', 
                   server_default='active',
                   schema='public')
