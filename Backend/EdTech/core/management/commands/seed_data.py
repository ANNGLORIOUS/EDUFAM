# # File: core/management/commands/seed_data.py

# from django.core.management.base import BaseCommand
# from django.contrib.auth import get_user_model
# from django.db import transaction
# from django.utils import timezone
# from decimal import Decimal
# import random
# from datetime import date, timedelta

# from core.models import (
#     School, AcademicYear, Term, ClassRoom, Subject, Student, Parent,
#     StudentParentRelation, GradeRecord, AttendanceRecord, FeeStructure,
#     FeeAccount, Payment, MessageThread, Message, Consent
# )

# User = get_user_model()


# class Command(BaseCommand):
#     help = 'Seed the database with test data for school management system'

#     def add_arguments(self, parser):
#         parser.add_argument(
#             '--clear',
#             action='store_true',
#             help='Clear existing data before seeding',
#         )

#     def handle(self, *args, **options):
#         if options['clear']:
#             self.stdout.write(self.style.WARNING('Clearing existing data...'))
#             self.clear_data()

#         self.stdout.write('Starting data seeding...')
        
#         try:
#             with transaction.atomic():
#                 school = self.create_school()
#                 academic_year = self.create_academic_year(school)
#                 terms = self.create_terms(academic_year)
#                 subjects = self.create_subjects(school)
#                 classes = self.create_classes(school, academic_year)
                
#                 teachers = self.create_teachers()
#                 parent_users = self.create_parent_users()
#                 parents = self.create_parents(parent_users)
                
#                 students = self.create_students(school, classes, parents)
#                 self.create_student_parent_relations(students, parents)
                
#                 self.create_grades(students, subjects, terms, teachers)
#                 self.create_attendance(students, subjects, teachers)
                
#                 fee_structures = self.create_fee_structures(classes, terms)
#                 self.create_fee_accounts_and_payments(students, parents, fee_structures)
                
#                 self.create_messages(parents, teachers, students)
                
#                 self.create_consent_records(students, parents)
                
#                 self.stdout.write(
#                     self.style.SUCCESS('Successfully seeded database with test data!')
#                 )
#                 self.print_summary()
                
#         except Exception as e:
#             self.stdout.write(
#                 self.style.ERROR(f'Error seeding data: {str(e)}')
#             )
#             raise

#     def clear_data(self):
#         models_to_clear = [
#             Message, MessageThread, Payment, FeeAccount, FeeStructure,
#             AttendanceRecord, GradeRecord, StudentParentRelation, Consent,
#             Student, Parent, Subject, ClassRoom, Term, AcademicYear, School
#         ]
        
#         for model in models_to_clear:
#             model.objects.all().delete()
        
#         User.objects.filter(is_superuser=False).delete()

#     def create_school(self):
#         school = School.objects.create(
#             name="Greenfield International School",
#             code="GIS001",
#             address="123 Education Avenue, Nairobi",
#             phone="+254712345000",
#             email="info@greenfieldschool.ac.ke",
#             established_date=date(2010, 1, 15),
#             is_active=True
#         )
#         self.stdout.write(f'Created school: {school.name}')
#         return school

#     def create_academic_year(self, school):
#         academic_year = AcademicYear.objects.create(
#             name="2024-2025",
#             start_date=date(2024, 1, 8),
#             end_date=date(2024, 12, 20),
#             is_current=True,
#             school=school
#         )
#         self.stdout.write(f'Created academic year: {academic_year.name}')
#         return academic_year

#     def create_terms(self, academic_year):
#         terms = []
#         term_dates = [
#             (1, date(2024, 1, 8), date(2024, 4, 12)),
#             (2, date(2024, 5, 6), date(2024, 8, 16)),
#             (3, date(2024, 9, 2), date(2024, 12, 20)),
#         ]
        
#         for term_num, start_date, end_date in term_dates:
#             term = Term.objects.create(
#                 academic_year=academic_year,
#                 term_number=term_num,
#                 start_date=start_date,
#                 end_date=end_date,
#                 is_current=(term_num == 2)  
#             )
#             terms.append(term)
        
#         self.stdout.write(f'Created {len(terms)} terms')
#         return terms

#     def create_subjects(self, school):
#         subjects_data = [
#             ("Mathematics", "MATH", True),
#             ("English", "ENG", True),
#             ("Kiswahili", "KIS", True),
#             ("Science", "SCI", True),
#             ("Social Studies", "SST", True),
#             ("Art and Craft", "ART", False),
#             ("Physical Education", "PE", False),
#             ("Music", "MUS", False),
#             ("Computer Studies", "COMP", False),
#             ("Religious Education", "RE", False),
#         ]
        
#         subjects = []
#         for name, code, is_core in subjects_data:
#             subject = Subject.objects.create(
#                 name=name,
#                 code=code,
#                 school=school,
#                 is_core=is_core,
#                 description=f"{name} curriculum for primary education"
#             )
#             subjects.append(subject)
        
#         self.stdout.write(f'Created {len(subjects)} subjects')
#         return subjects

#     def create_classes(self, school, academic_year):
#         classes = []
#         for grade in range(1, 9):  
#             for section in ['A', 'B']:
#                 class_room = ClassRoom.objects.create(
#                     name=f"Grade {grade}{section}",
#                     grade_level=grade,
#                     section=section,
#                     school=school,
#                     academic_year=academic_year,
#                     capacity=35
#                 )
#                 classes.append(class_room)
        
#         self.stdout.write(f'Created {len(classes)} classes')
#         return classes

#     def create_teachers(self):
#         teachers = []
#         teacher_data = [
#             ("mary.smith", "Mary", "Smith", "mary.smith@school.com", "+254701234567"),
#             ("john.doe", "John", "Doe", "john.doe@school.com", "+254701234568"),
#             ("sarah.wilson", "Sarah", "Wilson", "sarah.wilson@school.com", "+254701234569"),
#             ("david.brown", "David", "Brown", "david.brown@school.com", "+254701234570"),
#             ("lisa.johnson", "Lisa", "Johnson", "lisa.johnson@school.com", "+254701234571"),
#         ]
        
#         for username, first_name, last_name, email, phone in teacher_data:
#             teacher = User.objects.create_user(
#                 username=username,
#                 email=email,
#                 first_name=first_name,
#                 last_name=last_name,
#                 phone_number=phone,
#                 user_type='teacher',
#                 password='teacher123'
#             )
#             teachers.append(teacher)
        
#         self.stdout.write(f'Created {len(teachers)} teachers')
#         return teachers

#     def create_parent_users(self):
#         parents = []
#         parent_data = [
#             ("james.kamau", "James", "Kamau", "james.kamau@email.com", "+254712345678"),
#             ("grace.wanjiku", "Grace", "Wanjiku", "grace.wanjiku@email.com", "+254712345679"),
#             ("peter.otieno", "Peter", "Otieno", "peter.otieno@email.com", "+254712345680"),
#             ("mary.akinyi", "Mary", "Akinyi", "mary.akinyi@email.com", "+254712345681"),
#             ("samuel.mwangi", "Samuel", "Mwangi", "samuel.mwangi@email.com", "+254712345682"),
#             ("elizabeth.nyong", "Elizabeth", "Nyong", "elizabeth.nyong@email.com", "+254712345683"),
#             ("joseph.kiprop", "Joseph", "Kiprop", "joseph.kiprop@email.com", "+254712345684"),
#             ("hannah.wawira", "Hannah", "Wawira", "hannah.wawira@email.com", "+254712345685"),
#             ("daniel.mutua", "Daniel", "Mutua", "daniel.mutua@email.com", "+254712345686"),
#             ("rebecca.chege", "Rebecca", "Chege", "rebecca.chege@email.com", "+254712345687"),
#         ]
        
#         for username, first_name, last_name, email, phone in parent_data:
#             parent = User.objects.create_user(
#                 username=username,
#                 email=email,
#                 first_name=first_name,
#                 last_name=last_name,
#                 phone_number=phone,
#                 user_type='parent',
#                 password='parent123'
#             )
#             parents.append(parent)
        
#         self.stdout.write(f'Created {len(parents)} parent users')
#         return parents

#     def create_parents(self, parent_users):
#         parents = []
#         addresses = [
#             "Kileleshwa, Nairobi",
#             "Westlands, Nairobi",
#             "Karen, Nairobi",
#             "Kilimani, Nairobi",
#             "Lavington, Nairobi",
#             "Parklands, Nairobi",
#             "South B, Nairobi",
#             "South C, Nairobi",
#             "Hurlingham, Nairobi",
#             "Runda, Nairobi",
#         ]
        
#         occupations = [
#             "Software Engineer", "Teacher", "Nurse", "Accountant", "Engineer",
#             "Lawyer", "Doctor", "Business Owner", "Consultant", "Manager"
#         ]
        
#         for i, parent_user in enumerate(parent_users):
#             parent = Parent.objects.create(
#                 user=parent_user,
#                 address=addresses[i],
#                 occupation=random.choice(occupations),
#                 emergency_contact=f"+254{random.randint(700000000, 799999999)}",
#                 relationship_to_student=random.choice(['mother', 'father', 'guardian']),
#                 is_primary_contact=True
#             )
#             parents.append(parent)
        
#         self.stdout.write(f'Created {len(parents)} parent profiles')
#         return parents

#     def create_students(self, school, classes, parents):
#         students = []
#         kenyan_names = [
#             ("Faith", "Wanjiru"), ("Brian", "Ochieng"), ("Mercy", "Achieng"),
#             ("Kevin", "Mwangi"), ("Joy", "Njeri"), ("Dennis", "Kiprotich"),
#             ("Esther", "Waweru"), ("Victor", "Mutiso"), ("Grace", "Wangari"),
#             ("Allan", "Omondi"), ("Priscilla", "Chebet"), ("Collins", "Njoroge"),
#             ("Lydia", "Wairimu"), ("Francis", "Kiptoo"), ("Christine", "Auma"),
#             ("Felix", "Karanja"), ("Winnie", "Nyambura"), ("Martin", "Wekesa"),
#             ("Joyce", "Muthoni"), ("Emmanuel", "Gitau")
#         ]
        
#         admission_counter = 2024001
        
#         for i, (first_name, last_name) in enumerate(kenyan_names):
#             birth_year = random.randint(2010, 2018)
#             birth_month = random.randint(1, 12)
#             birth_day = random.randint(1, 28)
            
#             student = Student.objects.create(
#                 admission_number=str(admission_counter),
#                 first_name=first_name,
#                 last_name=last_name,
#                 date_of_birth=date(birth_year, birth_month, birth_day),
#                 gender=random.choice(['M', 'F']),
#                 school=school,
#                 current_class=random.choice(classes),
#                 admission_date=date(2024, 1, 8),
#                 address=f"{random.choice(['Estate A', 'Estate B', 'Estate C'])}, Nairobi"
#             )
#             students.append(student)
#             admission_counter += 1
        
#         self.stdout.write(f'Created {len(students)} students')
#         return students

#     def create_student_parent_relations(self, students, parents):
#         relationships = []
        
#         parent_index = 0
#         for student in students:
#             if parent_index < len(parents):
#                 relation = StudentParentRelation.objects.create(
#                     student=student,
#                     parent=parents[parent_index],
#                     relationship_type=random.choice(['mother', 'father', 'guardian']),
#                     is_emergency_contact=True,
#                     is_fee_responsible=True
#                 )
#                 relationships.append(relation)
                
#                 if random.choice([True, False]) and parent_index + 1 < len(parents):
#                     second_relation = StudentParentRelation.objects.create(
#                         student=student,
#                         parent=parents[parent_index + 1],
#                         relationship_type=random.choice(['mother', 'father']),
#                         is_emergency_contact=False,
#                         is_fee_responsible=False
#                     )
#                     relationships.append(second_relation)
                
#                 if random.choice([True, False, False]):
#                     parent_index += 1
        
#         self.stdout.write(f'Created {len(relationships)} student-parent relationships')
#         return relationships

#     def create_grades(self, students, subjects, terms, teachers):
#         grades = []
#         assessment_types = ['assignment', 'quiz', 'midterm', 'final', 'project']
        
#         for student in students:
#             for subject in subjects[:5]:  
#                 for term in terms[:2]:  
#                     for i in range(random.randint(3, 5)):
#                         total_marks = random.choice([20, 30, 40, 50, 100])
#                         obtained_marks = round(random.uniform(0.4, 0.95) * total_marks, 1)
                        
#                         assessment_date = term.start_date + timedelta(
#                             days=random.randint(1, (term.end_date - term.start_date).days)
#                         )
                        
#                         grade = GradeRecord.objects.create(
#                             student=student,
#                             subject=subject,
#                             term=term,
#                             teacher=random.choice(teachers),
#                             assessment_type=random.choice(assessment_types),
#                             assessment_name=f"{subject.name} {random.choice(assessment_types).title()} {i+1}",
#                             total_marks=Decimal(str(total_marks)),
#                             obtained_marks=Decimal(str(obtained_marks)),
#                             assessment_date=assessment_date,
#                             comments=random.choice([
#                                 "Good performance", "Needs improvement", "Excellent work",
#                                 "Keep it up", "Well done", "Practice more"
#                             ]) if random.choice([True, False]) else ""
#                         )
#                         grades.append(grade)
        
#         self.stdout.write(f'Created {len(grades)} grade records')
#         return grades

#     def create_attendance(self, students, subjects, teachers):
#         attendance_records = []
#         end_date = date.today()
#         start_date = end_date - timedelta(days=60)
        
#         current_date = start_date
#         while current_date <= end_date:
#             if current_date.weekday() < 5:  
#                 for student in students:
#                     status = random.choices(
#                         ['present', 'absent', 'late', 'excused'],
#                         weights=[85, 5, 8, 2]
#                     )[0]
                    
#                     attendance = AttendanceRecord.objects.create(
#                         student=student,
#                         date=current_date,
#                         status=status,
#                         recorded_by=random.choice(teachers),
#                         notes="Sick" if status == 'excused' else ""
#                     )
#                     attendance_records.append(attendance)
            
#             current_date += timedelta(days=1)
        
#         self.stdout.write(f'Created {len(attendance_records)} attendance records')
#         return attendance_records

#     def create_fee_structures(self, classes, terms):
#         fee_structures = []
        
#         fee_types = [
#             ("Tuition Fee", 25000),
#             ("Transport Fee", 5000),
#             ("Lunch Fee", 3000),
#             ("Activity Fee", 2000),
#             ("Library Fee", 1000),
#         ]
        
#         for term in terms:
#             for fee_name, amount in fee_types:
#                 fee_structure = FeeStructure.objects.create(
#                     name=fee_name,
#                     amount=Decimal(str(amount)),
#                     term=term,
#                     is_mandatory=(fee_name in ["Tuition Fee", "Activity Fee"]),
#                     due_date=term.start_date + timedelta(days=30),
#                     description=f"{fee_name} for {term}"
#                 )
#                 fee_structure.class_rooms.set(classes)
#                 fee_structures.append(fee_structure)
        
#         self.stdout.write(f'Created {len(fee_structures)} fee structures')
#         return fee_structures

#     def create_fee_accounts_and_payments(self, students, parents, fee_structures):
#         payments = []
        
#         for student in students:
#             total_due = sum([fs.amount for fs in fee_structures if student.current_class in fs.class_rooms.all()])
            
#             fee_account = FeeAccount.objects.create(
#                 student=student,
#                 total_fee_due=total_due
#             )
            
#             fee_parent = student.parents.filter(
#                 studentparentrelation__is_fee_responsible=True
#             ).first()
            
#             if fee_parent:
#                 num_payments = random.randint(1, 3)
#                 total_paid = Decimal('0.00')
                
#                 for i in range(num_payments):
#                     remaining = total_due - total_paid
#                     if remaining > 0:
#                         payment_amount = min(
#                             remaining,
#                             Decimal(str(random.randint(5000, 15000)))
#                         )
                        
#                         payment_date = timezone.now() - timedelta(days=random.randint(1, 90))
                        
#                         payment = Payment.objects.create(
#                             student=student,
#                             amount=payment_amount,
#                             payment_method=random.choice(['mpesa', 'bank', 'cash']),
#                             transaction_reference=f"TXN{random.randint(100000, 999999)}",
#                             mpesa_receipt=f"QEZ{random.randint(100000, 999999)}" if random.choice([True, False]) else "",
#                             status='completed',
#                             paid_by=fee_parent,
#                             payment_date=payment_date,
#                             notes=f"Payment {i+1} for {student.first_name}"
#                         )
#                         payments.append(payment)
#                         total_paid += payment_amount
                
#                 fee_account.total_paid = total_paid
#                 fee_account.update_balance()
        
#         self.stdout.write(f'Created {len(payments)} payments')
#         return payments

#     def create_messages(self, parents, teachers, students):
#         threads = []
#         messages = []
        
#         for i in range(random.randint(10, 15)):
#             parent = random.choice(parents)
#             teacher = random.choice(teachers)
#             student = random.choice(list(parent.children.all())) if parent.children.exists() else None
            
#             subjects_list = [
#                 "Question about homework",
#                 "Discuss academic progress",
#                 "Absence notification",
#                 "Parent-teacher meeting",
#                 "Behavioral concern",
#                 "Academic performance",
#                 "School event inquiry",
#                 "Medical information update"
#             ]
            
#             thread = MessageThread.objects.create(
#                 subject=random.choice(subjects_list),
#                 student=student
#             )
#             thread.participants.set([parent.user, teacher])
#             threads.append(thread)
            
#             for msg_num in range(random.randint(2, 5)):
#                 sender = random.choice([parent.user, teacher])
                
#                 message_contents = [
#                     "Thank you for your message. I'll look into this matter.",
#                     "I wanted to discuss my child's recent performance in class.",
#                     "The homework assignment was quite challenging. Could you provide some guidance?",
#                     "I'm pleased with the progress shown this term.",
#                     "Could we schedule a meeting to discuss this further?",
#                     "I have some concerns I'd like to address.",
#                     "The recent test results were very encouraging.",
#                     "I'll ensure the homework is completed on time going forward."
#                 ]
                
#                 created_time = timezone.now() - timedelta(
#                     days=random.randint(1, 30),
#                     hours=random.randint(0, 23)
#                 )
                
#                 message = Message.objects.create(
#                     thread=thread,
#                     sender=sender,
#                     content=random.choice(message_contents),
#                     is_read=random.choice([True, False]),
#                     created_at=created_time
#                 )
#                 messages.append(message)
        
#         self.stdout.write(f'Created {len(threads)} message threads with {len(messages)} messages')
#         return threads, messages

#     def create_consent_records(self, students, parents):
#         consents = []
#         consent_types = ['data_sharing', 'medical_info', 'photo_video', 'communication', 'emergency_contact']
        
#         for student in students:
#             primary_parent = student.parents.filter(
#                 studentparentrelation__is_emergency_contact=True
#             ).first()
            
#             if primary_parent:
#                 for consent_type in random.sample(consent_types, random.randint(2, 4)):
#                     is_granted = random.choice([True, False])
                    
#                     consent = Consent.objects.create(
#                         student=student,
#                         parent=primary_parent,
#                         consent_type=consent_type,
#                         is_granted=is_granted,
#                         granted_at=timezone.now() - timedelta(days=random.randint(1, 60)) if is_granted else None,
#                         notes=random.choice([
#                             "Approved for school activities",
#                             "Medical information can be shared with school nurse",
#                             "Photos can be used for school website",
#                             "Emergency contact authorization given",
#                             ""
#                         ])
#                     )
#                     consents.append(consent)
        
#         self.stdout.write(f'Created {len(consents)} consent records')
#         return consents

#     def print_summary(self):
#         self.stdout.write("\n" + "="*50)
#         self.stdout.write(self.style.SUCCESS("DATA SEEDING SUMMARY"))
#         self.stdout.write("="*50)
        
#         counts = {
#             'Schools': School.objects.count(),
#             'Academic Years': AcademicYear.objects.count(),
#             'Terms': Term.objects.count(),
#             'Classes': ClassRoom.objects.count(),
#             'Subjects': Subject.objects.count(),
#             'Users': User.objects.count(),
#             'Parents': Parent.objects.count(),
#             'Students': Student.objects.count(),
#             'Student-Parent Relations': StudentParentRelation.objects.count(),
#             'Grades': GradeRecord.objects.count(),
#             'Attendance Records': AttendanceRecord.objects.count(),
#             'Fee Structures': FeeStructure.objects.count(),
#             'Fee Accounts': FeeAccount.objects.count(),
#             'Payments': Payment.objects.count(),
#             'Message Threads': MessageThread.objects.count(),
#             'Messages': Message.objects.count(),
#             'Consent Records': Consent.objects.count(),
#         }
        
#         for item, count in counts.items():
#             self.stdout.write(f"{item:<25}: {count}")
        
#         self.stdout.write("\n" + "="*50)
#         self.stdout.write(self.style.SUCCESS("LOGIN CREDENTIALS"))
#         self.stdout.write("="*50)
#         self.stdout.write("Parent Users (password: parent123):")
#         for parent in Parent.objects.all()[:5]:
#             self.stdout.write(f"  - {parent.user.username}")
        
#         self.stdout.write("\nTeacher Users (password: teacher123):")
#         for teacher in User.objects.filter(user_type='teacher')[:3]:
#             self.stdout.write(f"  - {teacher.username}")
        
#         self.stdout.write("\n" + "="*50)