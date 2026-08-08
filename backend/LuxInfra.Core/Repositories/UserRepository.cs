using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

public interface IUserRepository
{
    Task<List<AppUser>> GetUsersAsync();
    Task<AppUser?> GetUserAsync(int id);
    Task<AppUser?> GetUserByUsernameAsync(string username);
    Task InsertUserAsync(AppUser user);
    Task UpdateUserAsync(AppUser user);
    Task DeleteUserAsync(int id);

    Task CreateSessionAsync(UserSession session);
    Task<UserSession?> GetSessionAsync(string token);
    Task RevokeSessionAsync(string token);
    Task<List<UserSession>> GetSessionsAsync();
}

public class UserRepository : IUserRepository
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public UserRepository(DatabaseService db) => _db = db;

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<AppUser>();
            await conn.CreateTableAsync<UserSession>();
            _initialized = true;
        }
        return conn;
    }

    public async Task<List<AppUser>> GetUsersAsync()
    {
        var conn = await Conn();
        return await conn.Table<AppUser>().OrderBy(u => u.Username).ToListAsync();
    }

    public async Task<AppUser?> GetUserAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<AppUser>(id);
    }

    public async Task<AppUser?> GetUserByUsernameAsync(string username)
    {
        var conn = await Conn();
        var name = username.Trim().ToLowerInvariant();
        return (await conn.Table<AppUser>().ToListAsync()).FirstOrDefault(u => u.Username.Trim().ToLowerInvariant() == name);
    }

    public async Task InsertUserAsync(AppUser user)
    {
        var conn = await Conn();
        await conn.InsertAsync(user);
    }

    public async Task UpdateUserAsync(AppUser user)
    {
        var conn = await Conn();
        await conn.UpdateAsync(user);
    }

    public async Task DeleteUserAsync(int id)
    {
        var conn = await Conn();
        await conn.DeleteAsync<AppUser>(id);
    }

    public async Task CreateSessionAsync(UserSession session)
    {
        var conn = await Conn();
        await conn.InsertAsync(session);
    }

    public async Task<UserSession?> GetSessionAsync(string token)
    {
        var conn = await Conn();
        return await conn.FindAsync<UserSession>(token);
    }

    public async Task RevokeSessionAsync(string token)
    {
        var conn = await Conn();
        await conn.DeleteAsync<UserSession>(token);
    }

    public async Task<List<UserSession>> GetSessionsAsync()
    {
        var conn = await Conn();
        return await conn.Table<UserSession>().OrderByDescending(s => s.CreatedAt).ToListAsync();
    }
}
