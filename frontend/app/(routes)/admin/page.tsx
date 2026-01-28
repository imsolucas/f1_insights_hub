'use client';

import { useState, useEffect } from 'react';
import { useDrivers } from '../../../lib/hooks/use-drivers';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi, UpdateDriverRequest, UpdateConstructorRequest } from '../../../lib/api-client';
import { useConstructors } from '../../../lib/hooks/use-constructors';
import { useSyncDrivers } from '../../../lib/hooks/use-sync-drivers';
import { useSyncConstructors } from '../../../lib/hooks/use-sync-constructors';
import { useSyncLineups } from '../../../lib/hooks/use-sync-lineups';
import { CreateDriverRequest, CreateConstructorRequest } from '../../../lib/api-client';
import { ErrorState } from '../../_components/error-state';

const SEASON_STORAGE_KEY_DRIVERS = 'f1-insight-hub-admin-sync-season-drivers';
const SEASON_STORAGE_KEY_CONSTRUCTORS = 'f1-insight-hub-admin-sync-season-constructors';
const SEASON_STORAGE_KEY_LINEUPS = 'f1-insight-hub-admin-sync-season-lineups';

export default function AdminPage() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<'driver' | 'add-driver' | 'constructor' | 'add-constructor' | 'sync'>('driver');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedConstructorId, setSelectedConstructorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: driversData, isLoading: driversLoading } = useDrivers({ active: undefined });
  const { data: constructorsData, isLoading: constructorsLoading } = useConstructors();
  const queryClient = useQueryClient();
  
  // Sync functionality - Separate state for each section with localStorage persistence
  const getInitialSeason = (storageKey: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= currentYear - 10 && parsed <= currentYear + 1) {
          return parsed;
        }
      }
    }
    return currentYear;
  };

  const [syncDriversSeason, setSyncDriversSeason] = useState<number>(() => getInitialSeason(SEASON_STORAGE_KEY_DRIVERS));
  const [syncConstructorsSeason, setSyncConstructorsSeason] = useState<number>(() => getInitialSeason(SEASON_STORAGE_KEY_CONSTRUCTORS));
  const [syncLineupsSeason, setSyncLineupsSeason] = useState<number>(() => getInitialSeason(SEASON_STORAGE_KEY_LINEUPS));
  const [filterConfirmed, setFilterConfirmed] = useState(true);
  const syncDrivers = useSyncDrivers();
  const syncConstructors = useSyncConstructors();
  const syncLineups = useSyncLineups();

  // Save seasons to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY_DRIVERS, syncDriversSeason.toString());
    }
  }, [syncDriversSeason]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY_CONSTRUCTORS, syncConstructorsSeason.toString());
    }
  }, [syncConstructorsSeason]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY_LINEUPS, syncLineupsSeason.toString());
    }
  }, [syncLineupsSeason]);

  const drivers = driversData?.drivers || [];
  const constructors = constructorsData?.constructors || [];

  const selectedDriver = drivers.find((d) => d.driverId === selectedDriverId);
  const selectedConstructor = constructors.find((c) => c.constructorId === selectedConstructorId);

  const handleUpdateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData: UpdateDriverRequest = {
        driverId: selectedDriver.driverId,
      };

      const code = formData.get('code')?.toString();
      const forename = formData.get('forename')?.toString();
      const surname = formData.get('surname')?.toString();
      const dateOfBirth = formData.get('dateOfBirth')?.toString();
      const nationality = formData.get('nationality')?.toString();
      const url = formData.get('url')?.toString();
      const permanentNumber = formData.get('permanentNumber')?.toString();
      const currentTeam = formData.get('currentTeam')?.toString();
      const isActive = formData.get('isActive')?.toString() === 'true';
      const driverChampionships = formData.get('driverChampionships')?.toString();
      const constructorChampionships = formData.get('constructorChampionships')?.toString();

      if (code !== undefined && code !== selectedDriver.code) updateData.code = code || null;
      if (forename && forename !== selectedDriver.forename) updateData.forename = forename;
      if (surname && surname !== selectedDriver.surname) updateData.surname = surname;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
      if (nationality && nationality !== selectedDriver.nationality) updateData.nationality = nationality;
      if (url !== undefined) updateData.url = url || null;
      if (permanentNumber !== undefined) {
        updateData.permanentNumber = permanentNumber ? parseInt(permanentNumber) : null;
      }
      if (currentTeam !== undefined) updateData.currentTeam = currentTeam || null;
      if (isActive !== selectedDriver.isActive) updateData.isActive = isActive;
      if (driverChampionships !== undefined) {
        updateData.driverChampionships = parseInt(driverChampionships);
      }
      if (constructorChampionships !== undefined) {
        updateData.constructorChampionships = parseInt(constructorChampionships);
      }

      await adminApi.updateDriver(updateData);
      setSuccess('Driver updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDriverTeam = async (driverId: string, teamName: string | null) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await adminApi.updateDriverTeam(driverId, teamName);
      setSuccess('Driver team updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update driver team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateConstructor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedConstructor) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData: UpdateConstructorRequest = {
        constructorId: selectedConstructor.constructorId,
      };

      const name = formData.get('name')?.toString();
      const nationality = formData.get('nationality')?.toString();
      const url = formData.get('url')?.toString();

      if (name && name !== selectedConstructor.name) updateData.name = name;
      if (nationality && nationality !== selectedConstructor.nationality) updateData.nationality = nationality;
      if (url !== undefined) updateData.url = url || null;

      await adminApi.updateConstructor(updateData);
      setSuccess('Constructor updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['constructors'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update constructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide mb-8">Admin Panel</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
          {success}
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-border flex-wrap">
        <button
          onClick={() => setActiveTab('driver')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'driver'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Update Driver
        </button>
        <button
          onClick={() => setActiveTab('add-driver')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'add-driver'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Add Driver
        </button>
        <button
          onClick={() => setActiveTab('constructor')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'constructor'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Update Constructor
        </button>
        <button
          onClick={() => setActiveTab('add-constructor')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'add-constructor'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Add Constructor
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'sync'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sync Data
        </button>
      </div>

      {activeTab === 'driver' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="driver-select" className="block text-sm font-medium text-foreground mb-2">
              Select Driver
            </label>
            <select
              id="driver-select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={driversLoading}
            >
              <option value="">-- Select a driver --</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.driverId}>
                  {driver.forename} {driver.surname} {driver.code ? `(${driver.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedDriver && (
            <form onSubmit={handleUpdateDriver} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-foreground mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    defaultValue={selectedDriver.code || ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="forename" className="block text-sm font-medium text-foreground mb-1">
                    Forename
                  </label>
                  <input
                    type="text"
                    id="forename"
                    name="forename"
                    defaultValue={selectedDriver.forename}
                    required
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-foreground mb-1">
                    Surname
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    defaultValue={selectedDriver.surname}
                    required
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    defaultValue={selectedDriver.dateOfBirth ? selectedDriver.dateOfBirth.split('T')[0] : ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-foreground mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    defaultValue={selectedDriver.nationality}
                    required
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="permanentNumber" className="block text-sm font-medium text-foreground mb-1">
                    Permanent Number
                  </label>
                  <input
                    type="number"
                    id="permanentNumber"
                    name="permanentNumber"
                    min="1"
                    max="99"
                    defaultValue={selectedDriver.permanentNumber || ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="currentTeam" className="block text-sm font-medium text-foreground mb-1">
                    Current Team
                  </label>
                  <input
                    type="text"
                    id="currentTeam"
                    name="currentTeam"
                    defaultValue={selectedDriver.currentTeam || ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    defaultValue={selectedDriver.url || ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="driverChampionships" className="block text-sm font-medium text-foreground mb-1">
                    Driver Championships
                  </label>
                  <input
                    type="number"
                    id="driverChampionships"
                    name="driverChampionships"
                    min="0"
                    defaultValue={selectedDriver.driverChampionships}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="constructorChampionships" className="block text-sm font-medium text-foreground mb-1">
                    Constructor Championships
                  </label>
                  <input
                    type="number"
                    id="constructorChampionships"
                    name="constructorChampionships"
                    min="0"
                    defaultValue={selectedDriver.constructorChampionships}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={selectedDriver.isActive}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Updating...' : 'Update Driver'}
                </button>
              </div>
            </form>
          )}

          {selectedDriver && (
            <div className="mt-6 p-4 bg-surface border border-border rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateDriverTeam(selectedDriver.driverId, null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-foreground hover:bg-surface/80 transition-colors disabled:opacity-50 text-sm"
                >
                  Clear Team
                </button>
                {constructors.map((constructor) => (
                  <button
                    key={constructor.id}
                    onClick={() => handleUpdateDriverTeam(selectedDriver.driverId, constructor.name)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-surface border border-border rounded-lg text-foreground hover:bg-surface/80 transition-colors disabled:opacity-50 text-sm"
                  >
                    Set to {constructor.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'constructor' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="constructor-select" className="block text-sm font-medium text-foreground mb-2">
              Select Constructor
            </label>
            <select
              id="constructor-select"
              value={selectedConstructorId}
              onChange={(e) => setSelectedConstructorId(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={constructorsLoading}
            >
              <option value="">-- Select a constructor --</option>
              {constructors.map((constructor) => (
                <option key={constructor.id} value={constructor.constructorId}>
                  {constructor.name}
                </option>
              ))}
            </select>
          </div>

          {selectedConstructor && (
            <form onSubmit={handleUpdateConstructor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={selectedConstructor.name}
                    required
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-foreground mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    defaultValue={selectedConstructor.nationality}
                    required
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    defaultValue={selectedConstructor.url || ''}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Updating...' : 'Update Constructor'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'add-driver' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Add New Driver</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setSuccess(null);

              try {
                const formData = new FormData(e.currentTarget);
                const createData: CreateDriverRequest = {
                  driverId: formData.get('driverId')?.toString() || '',
                  code: formData.get('code')?.toString() || null,
                  forename: formData.get('forename')?.toString() || '',
                  surname: formData.get('surname')?.toString() || '',
                  dateOfBirth: formData.get('dateOfBirth')?.toString() || null,
                  nationality: formData.get('nationality')?.toString() || '',
                  url: formData.get('url')?.toString() || null,
                  permanentNumber: formData.get('permanentNumber')?.toString()
                    ? parseInt(formData.get('permanentNumber')!.toString())
                    : null,
                  currentTeam: formData.get('currentTeam')?.toString() || null,
                  isActive: formData.get('isActive')?.toString() === 'true',
                  driverChampionships: formData.get('driverChampionships')?.toString()
                    ? parseInt(formData.get('driverChampionships')!.toString())
                    : 0,
                  constructorChampionships: formData.get('constructorChampionships')?.toString()
                    ? parseInt(formData.get('constructorChampionships')!.toString())
                    : 0,
                };

                await adminApi.createDriver(createData);
                setSuccess('Driver created successfully!');
                queryClient.invalidateQueries({ queryKey: ['drivers'] });
                (e.target as HTMLFormElement).reset();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create driver');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-driverId" className="block text-sm font-medium text-foreground mb-1">
                  Driver ID *
                </label>
                <input
                  type="text"
                  id="add-driverId"
                  name="driverId"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-code" className="block text-sm font-medium text-foreground mb-1">
                  Code
                </label>
                <input
                  type="text"
                  id="add-code"
                  name="code"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-forename" className="block text-sm font-medium text-foreground mb-1">
                  Forename *
                </label>
                <input
                  type="text"
                  id="add-forename"
                  name="forename"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-surname" className="block text-sm font-medium text-foreground mb-1">
                  Surname *
                </label>
                <input
                  type="text"
                  id="add-surname"
                  name="surname"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-dateOfBirth" className="block text-sm font-medium text-foreground mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="add-dateOfBirth"
                  name="dateOfBirth"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-nationality" className="block text-sm font-medium text-foreground mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  id="add-nationality"
                  name="nationality"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-permanentNumber" className="block text-sm font-medium text-foreground mb-1">
                  Permanent Number
                </label>
                <input
                  type="number"
                  id="add-permanentNumber"
                  name="permanentNumber"
                  min="1"
                  max="99"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-currentTeam" className="block text-sm font-medium text-foreground mb-1">
                  Current Team
                </label>
                <input
                  type="text"
                  id="add-currentTeam"
                  name="currentTeam"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-url" className="block text-sm font-medium text-foreground mb-1">
                  URL
                </label>
                <input
                  type="url"
                  id="add-url"
                  name="url"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-driverChampionships" className="block text-sm font-medium text-foreground mb-1">
                  Driver Championships
                </label>
                <input
                  type="number"
                  id="add-driverChampionships"
                  name="driverChampionships"
                  min="0"
                  defaultValue="0"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-constructorChampionships" className="block text-sm font-medium text-foreground mb-1">
                  Constructor Championships
                </label>
                <input
                  type="number"
                  id="add-constructorChampionships"
                  name="constructorChampionships"
                  min="0"
                  defaultValue="0"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={true}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground">Active</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Driver'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'add-constructor' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Add New Constructor</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setSuccess(null);

              try {
                const formData = new FormData(e.currentTarget);
                const createData: CreateConstructorRequest = {
                  constructorId: formData.get('constructorId')?.toString() || '',
                  name: formData.get('name')?.toString() || '',
                  nationality: formData.get('nationality')?.toString() || '',
                  url: formData.get('url')?.toString() || null,
                };

                await adminApi.createConstructor(createData);
                setSuccess('Constructor created successfully!');
                queryClient.invalidateQueries({ queryKey: ['constructors'] });
                (e.target as HTMLFormElement).reset();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create constructor');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-constructorId" className="block text-sm font-medium text-foreground mb-1">
                  Constructor ID *
                </label>
                <input
                  type="text"
                  id="add-constructorId"
                  name="constructorId"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="add-name"
                  name="name"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="add-nationality-constructor" className="block text-sm font-medium text-foreground mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  id="add-nationality-constructor"
                  name="nationality"
                  required
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="add-url-constructor" className="block text-sm font-medium text-foreground mb-1">
                  URL
                </label>
                <input
                  type="url"
                  id="add-url-constructor"
                  name="url"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Constructor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="space-y-8">
          {/* Sync Drivers Section */}
          <div className="p-6 bg-surface border border-border rounded-lg">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Sync Drivers from FastF1
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="sync-season-drivers" className="block text-sm font-medium text-foreground mb-2">
                  Season
                </label>
                <select
                  id="sync-season-drivers"
                  value={syncDriversSeason}
                  onChange={(e) => setSyncDriversSeason(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={syncDrivers.isPending}
                >
                  {Array.from({ length: 11 }, (_, i) => currentYear - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {syncDriversSeason >= currentYear && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="filter-confirmed"
                    checked={filterConfirmed}
                    onChange={(e) => setFilterConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary"
                    disabled={syncDrivers.isPending}
                  />
                  <label htmlFor="filter-confirmed" className="text-sm text-foreground cursor-pointer">
                    Confirmed drivers only
                  </label>
                </div>
              )}

              <button
                onClick={async () => {
                  try {
                    await syncDrivers.mutateAsync({
                      season: syncDriversSeason,
                      filter_confirmed: syncDriversSeason >= currentYear ? filterConfirmed : undefined,
                    });
                    setSuccess('Drivers synced successfully!');
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to sync drivers');
                    setSuccess(null);
                  }
                }}
                disabled={syncDrivers.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {syncDrivers.isPending ? 'Syncing Drivers...' : 'Sync Drivers'}
              </button>
            </div>
          </div>

          {/* Sync Teams Section */}
          <div className="p-6 bg-surface border border-border rounded-lg">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Sync Teams from FastF1
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="sync-season-teams" className="block text-sm font-medium text-foreground mb-2">
                  Season
                </label>
                <select
                  id="sync-season-teams"
                  value={syncConstructorsSeason}
                  onChange={(e) => setSyncConstructorsSeason(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={syncConstructors.isPending}
                >
                  {Array.from({ length: 11 }, (_, i) => currentYear - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={async () => {
                  try {
                    await syncConstructors.mutateAsync({
                      season: syncConstructorsSeason,
                    });
                    setSuccess('Teams synced successfully!');
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to sync teams');
                    setSuccess(null);
                  }
                }}
                disabled={syncConstructors.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {syncConstructors.isPending ? 'Syncing Teams...' : 'Sync Teams'}
              </button>
            </div>
          </div>

          {/* Sync Lineups Section */}
          <div className="p-6 bg-surface border border-border rounded-lg">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Sync Lineups from FastF1
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sync driver and constructor lineups for a season. This updates team assignments and driver numbers used for filtering and sorting.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="sync-season-lineups" className="block text-sm font-medium text-foreground mb-2">
                  Season
                </label>
                <select
                  id="sync-season-lineups"
                  value={syncLineupsSeason}
                  onChange={(e) => setSyncLineupsSeason(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={syncLineups.isPending}
                >
                  {Array.from({ length: 11 }, (_, i) => currentYear - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={async () => {
                  try {
                    await syncLineups.mutateAsync({
                      season: syncLineupsSeason,
                    });
                    setSuccess('Lineups synced successfully!');
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to sync lineups');
                    setSuccess(null);
                  }
                }}
                disabled={syncLineups.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {syncLineups.isPending ? 'Syncing Lineups...' : 'Sync Lineups'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
