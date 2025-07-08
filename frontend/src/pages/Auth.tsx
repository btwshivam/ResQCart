import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Tab } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import type { UserRole } from '../types/auth';
import { authService } from '../services/auth.service';

const roleOptions: { value: UserRole; label: string; description: string; icon: string; color: string }[] = [
  {
    value: 'user',
    label: 'Store Manager',
    description: 'Manage inventory and prevent food waste in your store',
    icon: '🏪',
    color: 'from-emerald-500 to-green-500'
  },
  {
    value: 'rescue',
    label: 'Food Rescue Hero',
    description: 'Help distribute surplus food to those in need',
    icon: '🚚',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    value: 'admin',
    label: 'Platform Admin',
    description: 'Oversee and optimize the food waste prevention network',
    icon: '⚡',
    color: 'from-purple-500 to-pink-500'
  }
];

const loginValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const registerValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string().when('userType', {
    is: (val: string) => val === 'user' || val === 'rescue',
    then: () => Yup.string().required('Phone number is required')
  }),
  organizationName: Yup.string().when('userType', {
    is: 'rescue',
    then: () => Yup.string().required('Organization name is required')
  }),
  organizationType: Yup.string().when('userType', {
    is: 'rescue',
    then: () => Yup.string().required('Organization type is required')
  })
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const data = { ...values, userType: selectedRole };
      const response = isLogin
        ? await authService.login(data)
        : await authService.register(data);
      
      toast.success(response.message);
      navigate(`/${selectedRole}-dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <span className="text-4xl">🥬</span>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              ResQCart
            </h1>
          </div>
          <p className="text-xl text-gray-600">Walmart's Smart Food Waste Prevention</p>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back!' : 'Join Our Mission'}
        </h2>
        <p className="text-center text-lg text-gray-600 max-w-sm mx-auto">
          {isLogin ? 'Sign in to manage food waste prevention' : 'Start preventing food waste today'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-blue-100/50 sm:rounded-2xl sm:px-12 border border-blue-50 relative overflow-hidden backdrop-blur-sm bg-white/90">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
          
          <Tab.Group>
            <Tab.List className="flex space-x-3 rounded-xl bg-gray-100/80 p-2 mb-8">
              {roleOptions.map((role) => (
                <Tab
                  key={role.value}
                  className={({ selected }) =>
                    `w-full rounded-lg py-4 text-sm font-medium leading-5 transition-all duration-300 ease-out relative
                    ${selected
                      ? 'bg-white shadow-md transform scale-102'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}`
                  }
                  onClick={() => setSelectedRole(role.value)}
                >
                  {({ selected }) => (
                    <>
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-2xl transform transition-transform duration-300 ${selected ? 'scale-110' : ''}">{role.icon}</span>
                        <span className={selected ? `bg-gradient-to-r ${role.color} bg-clip-text text-transparent font-semibold` : ''}>
                          {role.label}
                        </span>
                      </div>
                      {selected && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r ${role.color}"></div>
                      )}
                    </>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <p className="text-sm text-gray-600 text-center mb-8 animate-fade-in">
              {roleOptions.find(r => r.value === selectedRole)?.description}
            </p>
          </Tab.Group>

          <Formik
            initialValues={{
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              phone: '',
              organizationName: '',
              organizationType: ''
            }}
            validationSchema={isLogin ? loginValidationSchema : registerValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-6">
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1 block w-full rounded-lg border-2 border-gray-200 pl-4 pr-10 py-3 
                        focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 
                        transition-all duration-200 group-hover:border-gray-300"
                        placeholder="you@example.com"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 transition-transform duration-200 group-hover:scale-110">✉️</span>
                      </div>
                    </div>
                    {errors.email && touched.email && (
                      <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.email}</div>
                    )}
                  </div>

                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        className="mt-1 block w-full rounded-lg border-2 border-gray-200 pl-4 pr-10 py-3
                        focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50
                        transition-all duration-200 group-hover:border-gray-300"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 transition-transform duration-200 group-hover:scale-110">🔒</span>
                      </div>
                    </div>
                    {errors.password && touched.password && (
                      <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.password}</div>
                    )}
                  </div>

                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First name
                          </label>
                          <Field
                            id="firstName"
                            name="firstName"
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 pl-4 py-3"
                            placeholder="John"
                          />
                          {errors.firstName && touched.firstName && (
                            <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
                          )}
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last name
                          </label>
                          <Field
                            id="lastName"
                            name="lastName"
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 pl-4 py-3"
                            placeholder="Doe"
                          />
                          {errors.lastName && touched.lastName && (
                            <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
                          )}
                        </div>
                      </div>

                      {(selectedRole === 'user' || selectedRole === 'rescue') && (
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone number
                          </label>
                          <div className="relative">
                            <Field
                              id="phone"
                              name="phone"
                              className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 pl-4 py-3"
                              placeholder="+1 (555) 000-0000"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-gray-400">📱</span>
                            </div>
                          </div>
                          {errors.phone && touched.phone && (
                            <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
                          )}
                        </div>
                      )}

                      {selectedRole === 'rescue' && (
                        <>
                          <div>
                            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                              Organization name
                            </label>
                            <div className="relative">
                              <Field
                                id="organizationName"
                                name="organizationName"
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 pl-4 py-3"
                                placeholder="Food Rescue Initiative"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-400">🏢</span>
                              </div>
                            </div>
                            {errors.organizationName && touched.organizationName && (
                              <div className="text-red-500 text-sm mt-1">{errors.organizationName}</div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-1">
                              Organization type
                            </label>
                            <div className="relative">
                              <Field
                                as="select"
                                id="organizationType"
                                name="organizationType"
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 pl-4 py-3 appearance-none"
                              >
                                <option value="">Select organization type</option>
                                <option value="NGO">Non-Profit Organization</option>
                                <option value="Government">Government Agency</option>
                                <option value="Private">Private Company</option>
                                <option value="Other">Other</option>
                              </Field>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-400">🔽</span>
                              </div>
                            </div>
                            {errors.organizationType && touched.organizationType && (
                              <div className="text-red-500 text-sm mt-1">{errors.organizationType}</div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg 
                    text-sm font-medium text-white bg-gradient-to-r ${roleOptions.find(r => r.value === selectedRole)?.color}
                    hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                    transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span className="mr-2 transform transition-transform group-hover:rotate-12">
                          {isLogin ? '🚀' : '✨'}
                        </span>
                        {isLogin ? 'Sign in' : 'Create account'}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-green-600 hover:text-green-500 font-medium transition-all duration-200 
                    hover:underline transform hover:scale-105"
                  >
                    {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="hover:text-gray-700 transition-colors duration-200">
            By continuing, you agree to ResQCart's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 