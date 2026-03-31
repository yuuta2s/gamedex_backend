import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop()
  password?: string; // undefined for Steam-only users

  @Prop({ required: true })
  username: string;

  @Prop()
  avatar?: string;

  @Prop({ unique: true, sparse: true })
  steamId?: string; // Steam OpenID identifier

  @Prop()
  steamDisplayName?: string;

  @Prop()
  refreshToken?: string; // hashed refresh token stored server-side
}

export const UserSchema = SchemaFactory.createForClass(User);
