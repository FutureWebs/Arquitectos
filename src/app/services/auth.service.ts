import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  rol: 'superadmin' | 'cliente';
  edificio_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(this.db, 'usuarios', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          this.userProfileSubject.next({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...userSnap.data()
          } as UserProfile);
        }
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  async login(email: string, pass: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, pass);
    return credential.user;
  }

  async logout() {
    await signOut(this.auth);
  }
}
