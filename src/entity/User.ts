import { IsEmail, Length } from "class-validator"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm"
import bcrypt from "bcrypt"
import { classToPlain, Exclude } from "class-transformer"

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super()
    Object.assign(this, user)
  }
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string

  @Index()
  @Length(3, 20, { message: "username must be at least 3 characters long" })
  @Column({ unique: true })
  username: string

  @Exclude()
  @Length(3, 20, { message: "password must be at least 3 characters long" })
  @Column()
  password: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 8)
  }

  toJSON() {
    return classToPlain(this)
  }
}
